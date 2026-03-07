const express = require('express');
const router = express.Router();
const pool = require('../../pg/db');
const bcrypt = require('bcryptjs');

// 공통: 로그인 체크
function requireLogin(req, res) {
  const discordId = req.user?.discord_id;
  if (!discordId) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  return String(discordId);
}

// 공통: room state 만들기 (필요할 때만 사용)
async function buildRoomState(client, roomId) {
  const itemsRes = await client.query(
    `
    select
      id,
      room_id as "roomId",
      set_key as "setKey",
      title,
      duration_sec as "durationSec",
      running,
      started_at as "startedAt",
      ends_at as "endsAt",
      created_by as "createdBy",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from timer_items
    where room_id = $1
    order by created_at asc
    `,
    [roomId],
  );

  return {
    roomId,
    items: itemsRes.rows,
    serverTime: new Date().toISOString(),
  };
}

// POST /timer/rooms
router.post('/', async (req, res) => {
  const ownerDiscordId = requireLogin(req, res);
  if (!ownerDiscordId) return;

  const { guildId, name, isPrivate = false, joinCode = null } = req.body || {};

  if (!guildId || !name) {
    return res.status(400).json({ message: 'guildId, name required' });
  }

  if (isPrivate && !joinCode) {
    return res
      .status(400)
      .json({ message: 'joinCode required for private room' });
  }

  const client = await pool.connect();
  try {
    await client.query('begin');

    const joinCodeHash =
      isPrivate && joinCode ? await bcrypt.hash(String(joinCode), 10) : null;

    const roomRes = await client.query(
      `
      insert into timer_rooms (guild_id, name, owner_discord_id, is_private, join_code)
      values ($1, $2, $3, $4, $5)
      returning id, guild_id, name, is_private, created_at
      `,
      [guildId, name, ownerDiscordId, isPrivate, joinCodeHash],
    );

    const room = roomRes.rows[0];

    // 만든 사람은 멤버로 등록
    await client.query(
      `
      insert into timer_room_members (room_id, discord_id, role)
      values ($1, $2, 'owner')
      on conflict (room_id, discord_id) do nothing
      `,
      [room.id, ownerDiscordId],
    );

    await client.query('commit');

    // 생성 직후 emit은 DB 재조회 없이 안전하게 0개로 뿌리면 됨
    const io = req.app.get('io') || global.io;
    if (io) {
      io.to(String(room.id)).emit('room:state', {
        roomId: room.id,
        items: [],
        serverTime: new Date().toISOString(),
      });
    }

    res.status(201).json({
      roomId: room.id,
      guildId: room.guild_id,
      name: room.name,
      isPrivate: room.is_private,
      createdAt: room.created_at,
    });
  } catch (e) {
    await client.query('rollback');
    console.error(e);
    res.status(500).json({ message: 'failed to create room' });
  } finally {
    client.release();
  }
});

// GET /timer/rooms  (내가 속한 방 목록)
router.get('/', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `
      select
        r.id as "roomId",
        r.name,
        r.guild_id as "guildId",
        r.is_private as "isPrivate",
        m.role as "myRole",
        r.created_at as "createdAt"
      from timer_room_members m
      join timer_rooms r on r.id = m.room_id
      where m.discord_id = $1
        and m.left_at is null
        and r.closed_at is null
      order by r.created_at desc
      `,
      [discordId],
    );

    res.json({ rooms: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'failed to list rooms' });
  } finally {
    client.release();
  }
});

// NEW: GET /timer/rooms/:roomId/meta
router.get('/:roomId/meta', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { roomId } = req.params;
  const client = await pool.connect();
  try {
    const { rows, rowCount } = await client.query(
      `
      select
        id as "roomId",
        name,
        is_private as "isPrivate",
        created_at as "createdAt"
      from timer_rooms
      where id = $1 and closed_at is null
      `,
      [roomId],
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'room not found' });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'failed to fetch room meta' });
  } finally {
    client.release();
  }
});

// NEW: POST /timer/rooms/:roomId/join
router.post('/:roomId/join', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { roomId } = req.params;
  const { joinCode = '' } = req.body || {};

  const client = await pool.connect();
  try {
    await client.query('begin');

    const roomRes = await client.query(
      `
      select
        id as "roomId",
        is_private as "isPrivate",
        join_code as "joinCodeHash",
        closed_at as "closedAt"
      from timer_rooms
      where id = $1
      limit 1
      `,
      [roomId],
    );

    if (roomRes.rowCount === 0 || roomRes.rows[0].closedAt) {
      await client.query('rollback');
      return res.status(404).json({ message: 'room not found' });
    }

    const room = roomRes.rows[0];

    // 이미 멤버면 OK
    const memRes = await client.query(
      `
      select role
      from timer_room_members
      where room_id = $1 and discord_id = $2 and left_at is null
      limit 1
      `,
      [roomId, discordId],
    );

    if (memRes.rowCount > 0) {
      await client.query('commit');
      return res.json({
        ok: true,
        alreadyMember: true,
        myRole: memRes.rows[0].role,
      });
    }

    // 비공개면 joinCode 검증
    if (room.isPrivate) {
      if (!joinCode) {
        await client.query('rollback');
        return res.status(400).json({ message: 'joinCode required' });
      }
      const ok = await bcrypt.compare(
        String(joinCode),
        String(room.joinCodeHash || ''),
      );
      if (!ok) {
        await client.query('rollback');
        return res.status(403).json({ message: 'invalid joinCode' });
      }
    }

    // 가입(역할은 member) + conflict 시 role 유지하고 left_at만 복구
    await client.query(
      `
      insert into timer_room_members (room_id, discord_id, role)
      values ($1, $2, 'member')
      on conflict (room_id, discord_id) do update
        set left_at = null
      `,
      [roomId, discordId],
    );

    await client.query('commit');
    res.json({ ok: true, myRole: 'member' });
  } catch (e) {
    await client.query('rollback');
    console.error(e);
    res.status(500).json({ message: 'failed to join room' });
  } finally {
    client.release();
  }
});

// GET /timer/rooms/:roomId (방 상세 + 내 역할)
router.get('/:roomId', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { roomId } = req.params;

  const client = await pool.connect();
  try {
    const roomRes = await client.query(
      `
      select
        id as "roomId",
        guild_id as "guildId",
        name,
        is_private as "isPrivate",
        created_at as "createdAt"
      from timer_rooms
      where id = $1 and closed_at is null
      `,
      [roomId],
    );

    if (roomRes.rowCount === 0) {
      return res.status(404).json({ message: 'room not found' });
    }

    const memRes = await client.query(
      `
      select role
      from timer_room_members
      where room_id = $1 and discord_id = $2 and left_at is null
      limit 1
      `,
      [roomId, discordId],
    );

    if (memRes.rowCount === 0) {
      return res.status(403).json({ message: 'Not a room member' });
    }

    res.json({
      ...roomRes.rows[0],
      myRole: memRes.rows[0].role,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'failed to fetch room' });
  } finally {
    client.release();
  }
});

// NEW: DELETE /timer/rooms/:roomId
router.delete('/:roomId', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { roomId } = req.params;
  const client = await pool.connect();

  try {
    await client.query('begin');

    const roomRes = await client.query(
      `
      select owner_discord_id as "ownerDiscordId", closed_at as "closedAt"
      from timer_rooms
      where id = $1
      `,
      [roomId],
    );

    if (roomRes.rowCount === 0 || roomRes.rows[0].closedAt) {
      await client.query('rollback');
      return res.status(404).json({ message: 'room not found' });
    }

    const owner = String(roomRes.rows[0].ownerDiscordId || '');
    if (owner !== String(discordId)) {
      await client.query('rollback');
      return res.status(403).json({ message: 'Only owner can delete room' });
    }

    await client.query(
      `
      update timer_rooms
      set closed_at = now()
      where id = $1 and closed_at is null
      `,
      [roomId],
    );

    await client.query(
      `
      update timer_room_members
      set left_at = now()
      where room_id = $1 and left_at is null
      `,
      [roomId],
    );

    await client.query('commit');

    const io = req.app.get('io') || global.io;
    if (io) {
      io.to(String(roomId)).emit('room:closed', { roomId });
    }

    res.json({ ok: true });
  } catch (e) {
    await client.query('rollback');
    console.error(e);
    res.status(500).json({ message: 'failed to delete room' });
  } finally {
    client.release();
  }
});

module.exports = router;
