const express = require('express');
const router = express.Router();
const pool = require('../../../pg/db');
const bcrypt = require('bcryptjs');
const { requireLogin } = require('./_common');

// POST /timer/rooms/:roomId/join
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

    return res.json({ ok: true, myRole: 'member' });
  } catch (e) {
    await client.query('rollback');
    console.error('[joinRoom] failed:', e);
    return res.status(500).json({ message: 'failed to join room' });
  } finally {
    client.release();
  }
});

module.exports = router;
