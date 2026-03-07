const express = require('express');
const router = express.Router();
const pool = require('../../pg/db');
const { validate: isUuid } = require('uuid');

/**
 * (서버 authoritative + socket 동기화)
 * 최종 경로:
 * - GET    /timer/items?roomId=...
 * - POST   /timer/items/replace
 * - POST   /timer/items
 * - PATCH  /timer/items/:itemId
 * - POST   /timer/items/:itemId/start
 * - POST   /timer/items/:itemId/stop
 * - DELETE /timer/items/:itemId
 */

// 공통: 로그인 체크
function requireLogin(req, res) {
  const discordId = req.user?.discord_id;
  if (!discordId) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  return String(discordId);
}

// 공통: room 열려있는지 체크
async function assertRoomOpen(client, roomId) {
  const r = await client.query(
    `
    select 1
    from timer_rooms
    where id = $1 and closed_at is null
    limit 1
    `,
    [String(roomId)],
  );
  return r.rowCount > 0;
}

// 공통: room 멤버 권한 확인 (room에 참여했는지)
async function assertRoomMember(client, roomId, discordId) {
  const r = await client.query(
    `
    select 1
    from timer_room_members
    where room_id = $1 and discord_id = $2 and left_at is null
    limit 1
    `,
    [String(roomId), String(discordId)],
  );
  return r.rowCount > 0;
}

// 공통: room:state payload 만들기
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
    [String(roomId)],
  );

  return {
    roomId: String(roomId),
    items: itemsRes.rows,
    serverTime: new Date().toISOString(),
  };
}

// 공통: socket 브로드캐스트
async function emitRoomState(req, client, roomId) {
  const io = req.app.get('io') || global.io;
  if (!io) return;
  const payload = await buildRoomState(client, roomId);
  io.to(String(roomId)).emit('room:state', payload);
}

// 1) 룸의 아이템 목록 조회
// GET /timer/items?roomId=uuid
router.get('/', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { roomId } = req.query;
  if (!roomId || !isUuid(roomId)) {
    return res.status(400).json({ message: 'roomId(uuid) required' });
  }

  const client = await pool.connect();
  try {
    const open = await assertRoomOpen(client, roomId);
    if (!open) return res.status(404).json({ message: 'room not found' });

    const ok = await assertRoomMember(client, roomId, discordId);
    if (!ok) return res.status(403).json({ message: 'Not a room member' });

    const payload = await buildRoomState(client, roomId);
    res.json(payload);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'failed to fetch items' });
  } finally {
    client.release();
  }
});

// 2) 세트 교체
// POST /timer/items/replace
// body: { roomId, setKey, items: [{ title, durationSec }] }
router.post('/replace', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { roomId, setKey, items } = req.body || {};
  if (!roomId || !isUuid(roomId) || !setKey || !Array.isArray(items)) {
    return res
      .status(400)
      .json({ message: 'roomId(uuid), setKey, items required' });
  }

  const cleaned = items
    .map((x) => ({
      title: String(x.title || '').trim(),
      durationSec: Number(x.durationSec),
    }))
    .filter(
      (x) => x.title && Number.isFinite(x.durationSec) && x.durationSec > 0,
    );

  const client = await pool.connect();
  try {
    await client.query('begin');

    const open = await assertRoomOpen(client, roomId);
    if (!open) {
      await client.query('rollback');
      return res.status(404).json({ message: 'room not found' });
    }

    const ok = await assertRoomMember(client, roomId, discordId);
    if (!ok) {
      await client.query('rollback');
      return res.status(403).json({ message: 'Not a room member' });
    }

    await client.query(
      `delete from timer_items where room_id=$1 and set_key=$2`,
      [roomId, setKey],
    );

    for (const it of cleaned) {
      await client.query(
        `
        insert into timer_items (room_id, set_key, title, duration_sec, created_by)
        values ($1, $2, $3, $4, $5)
        `,
        [roomId, setKey, it.title, it.durationSec, discordId],
      );
    }

    await client.query('commit');

    // 브로드캐스트 + 응답
    await emitRoomState(req, client, roomId);

    const payload = await buildRoomState(client, roomId);
    return res.json(payload);
  } catch (e) {
    await client.query('rollback');
    console.error('[replace] failed:', e);
    return res.status(500).json({ message: 'failed to replace items' });
  } finally {
    client.release();
  }
});

// 3) 단일 아이템 생성
// POST /timer/items
// body: { roomId, setKey, title, durationSec }
router.post('/', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { roomId, setKey, title, durationSec } = req.body || {};
  if (!roomId || !isUuid(roomId) || !setKey || !title || durationSec == null) {
    return res
      .status(400)
      .json({ message: 'roomId(uuid), setKey, title, durationSec required' });
  }

  const dur = Number(durationSec);
  if (!Number.isFinite(dur) || dur <= 0) {
    return res.status(400).json({ message: 'durationSec must be > 0' });
  }

  const client = await pool.connect();
  try {
    await client.query('begin');

    const open = await assertRoomOpen(client, roomId);
    if (!open) {
      await client.query('rollback');
      return res.status(404).json({ message: 'room not found' });
    }

    const ok = await assertRoomMember(client, roomId, discordId);
    if (!ok) {
      await client.query('rollback');
      return res.status(403).json({ message: 'Not a room member' });
    }

    const ins = await client.query(
      `
      insert into timer_items (room_id, set_key, title, duration_sec, created_by)
      values ($1, $2, $3, $4, $5)
      returning
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
      `,
      [roomId, setKey, String(title).trim(), dur, discordId],
    );

    await client.query('commit');

    await emitRoomState(req, client, roomId);

    res.status(201).json(ins.rows[0]);
  } catch (e) {
    await client.query('rollback');
    console.error(e);
    res.status(500).json({ message: 'failed to create item' });
  } finally {
    client.release();
  }
});

// 4) 아이템 제목/기간 수정
// PATCH /timer/items/:itemId
router.patch('/:itemId', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { itemId } = req.params;
  if (!isUuid(itemId)) {
    return res.status(400).json({ message: 'itemId must be uuid' });
  }

  const { title, durationSec } = req.body || {};
  if (title == null && durationSec == null) {
    return res.status(400).json({ message: 'title or durationSec required' });
  }

  const client = await pool.connect();
  try {
    await client.query('begin');

    const itemRes = await client.query(
      `select id, room_id, running from timer_items where id = $1`,
      [itemId],
    );
    if (itemRes.rowCount === 0) {
      await client.query('rollback');
      return res.status(404).json({ message: 'item not found' });
    }

    const { room_id: roomId, running } = itemRes.rows[0];

    const open = await assertRoomOpen(client, roomId);
    if (!open) {
      await client.query('rollback');
      return res.status(404).json({ message: 'room not found' });
    }

    const ok = await assertRoomMember(client, roomId, discordId);
    if (!ok) {
      await client.query('rollback');
      return res.status(403).json({ message: 'Not a room member' });
    }

    if (running) {
      await client.query('rollback');
      return res.status(409).json({ message: 'cannot edit while running' });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (title != null) {
      fields.push(`title = $${idx++}`);
      values.push(String(title).trim());
    }

    if (durationSec != null) {
      const dur = Number(durationSec);
      if (!Number.isFinite(dur) || dur <= 0) {
        await client.query('rollback');
        return res.status(400).json({ message: 'durationSec must be > 0' });
      }
      fields.push(`duration_sec = $${idx++}`);
      values.push(dur);
    }

    fields.push(`updated_at = now()`);
    values.push(itemId);

    const upd = await client.query(
      `
      update timer_items
      set ${fields.join(', ')}
      where id = $${idx}
      returning
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
      `,
      values,
    );

    await client.query('commit');

    await emitRoomState(req, client, roomId);

    res.json(upd.rows[0]);
  } catch (e) {
    await client.query('rollback');
    console.error(e);
    res.status(500).json({ message: 'failed to update item' });
  } finally {
    client.release();
  }
});

// 5) 시작
// POST /timer/items/:itemId/start
router.post('/:itemId/start', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { itemId } = req.params;
  if (!isUuid(itemId)) {
    return res.status(400).json({ message: 'itemId must be uuid' });
  }

  const client = await pool.connect();
  try {
    await client.query('begin');

    const itemRes = await client.query(
      `select id, room_id, running from timer_items where id = $1`,
      [itemId],
    );
    if (itemRes.rowCount === 0) {
      await client.query('rollback');
      return res.status(404).json({ message: 'item not found' });
    }

    const { room_id: roomId, running } = itemRes.rows[0];

    const open = await assertRoomOpen(client, roomId);
    if (!open) {
      await client.query('rollback');
      return res.status(404).json({ message: 'room not found' });
    }

    const ok = await assertRoomMember(client, roomId, discordId);
    if (!ok) {
      await client.query('rollback');
      return res.status(403).json({ message: 'Not a room member' });
    }

    if (running) {
      await client.query('rollback');
      return res.status(409).json({ message: 'already running' });
    }

    await client.query(
      `
      update timer_items
      set
        running = true,
        started_at = now(),
        ends_at = now() + (duration_sec * interval '1 second'),
        updated_at = now()
      where id = $1
      `,
      [itemId],
    );

    await client.query('commit');

    await emitRoomState(req, client, roomId);

    res.json({ ok: true });
  } catch (e) {
    await client.query('rollback');
    console.error(e);
    res.status(500).json({ message: 'failed to start item' });
  } finally {
    client.release();
  }
});

// 6) 정지
// POST /timer/items/:itemId/stop
router.post('/:itemId/stop', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { itemId } = req.params;
  if (!isUuid(itemId)) {
    return res.status(400).json({ message: 'itemId must be uuid' });
  }

  const client = await pool.connect();
  try {
    await client.query('begin');

    const itemRes = await client.query(
      `select id, room_id from timer_items where id = $1`,
      [itemId],
    );
    if (itemRes.rowCount === 0) {
      await client.query('rollback');
      return res.status(404).json({ message: 'item not found' });
    }

    const { room_id: roomId } = itemRes.rows[0];

    const open = await assertRoomOpen(client, roomId);
    if (!open) {
      await client.query('rollback');
      return res.status(404).json({ message: 'room not found' });
    }

    const ok = await assertRoomMember(client, roomId, discordId);
    if (!ok) {
      await client.query('rollback');
      return res.status(403).json({ message: 'Not a room member' });
    }

    await client.query(
      `
      update timer_items
      set
        running = false,
        started_at = null,
        ends_at = null,
        updated_at = now()
      where id = $1
      `,
      [itemId],
    );

    await client.query('commit');

    await emitRoomState(req, client, roomId);

    res.json({ ok: true });
  } catch (e) {
    await client.query('rollback');
    console.error(e);
    res.status(500).json({ message: 'failed to stop item' });
  } finally {
    client.release();
  }
});

// 7) 삭제
// DELETE /timer/items/:itemId
router.delete('/:itemId', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { itemId } = req.params;
  if (!isUuid(itemId)) {
    return res.status(400).json({ message: 'itemId must be uuid' });
  }

  const client = await pool.connect();
  try {
    await client.query('begin');

    const itemRes = await client.query(
      `select id, room_id from timer_items where id = $1`,
      [itemId],
    );
    if (itemRes.rowCount === 0) {
      await client.query('rollback');
      return res.status(404).json({ message: 'item not found' });
    }

    const { room_id: roomId } = itemRes.rows[0];

    const open = await assertRoomOpen(client, roomId);
    if (!open) {
      await client.query('rollback');
      return res.status(404).json({ message: 'room not found' });
    }

    const ok = await assertRoomMember(client, roomId, discordId);
    if (!ok) {
      await client.query('rollback');
      return res.status(403).json({ message: 'Not a room member' });
    }

    // ✅ 진짜 itemId 삭제
    await client.query(`delete from timer_items where id=$1`, [itemId]);

    await client.query('commit');

    await emitRoomState(req, client, roomId);

    res.json({ ok: true, itemId });
  } catch (e) {
    await client.query('rollback');
    console.error(e);
    res.status(500).json({ message: 'failed to delete item' });
  } finally {
    client.release();
  }
});

module.exports = router;
