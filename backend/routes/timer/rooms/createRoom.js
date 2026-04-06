const express = require('express');
const router = express.Router();
const pool = require('../../../pg/db');
const bcrypt = require('bcryptjs');
const { buildRoomState } = require('../../../services/timer/buildRoomState');
const { requireLogin } = require('./_common');

// POST /timer/rooms
router.post('/', async (req, res) => {
  const ownerDiscordId = requireLogin(req, res);
  if (!ownerDiscordId) return;

  const { name, isPrivate = false, joinCode = null } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: 'name required' });
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
      insert into timer_rooms (name, owner_discord_id, is_private, join_code)
      values ($1, $2, $3, $4)
      returning id, name, is_private, created_at
      `,
      [name, ownerDiscordId, isPrivate, joinCodeHash],
    );

    const room = roomRes.rows[0];

    await client.query(
      `
      insert into timer_room_members (room_id, discord_id, role)
      values ($1, $2, 'owner')
      on conflict (room_id, discord_id) do nothing
      `,
      [room.id, ownerDiscordId],
    );

    await client.query('commit');

    const io = req.app.get('io') || global.io;
    if (io) {
      const payload = await buildRoomState(client, room.id);
      io.to(String(room.id)).emit('room:state', payload);
    }

    return res.status(201).json({
      roomId: room.id,
      name: room.name,
      isPrivate: room.is_private,
      createdAt: room.created_at,
    });
  } catch (e) {
    await client.query('rollback');
    console.error('[createRoom] failed:', e);
    return res.status(500).json({ message: 'failed to create room' });
  } finally {
    client.release();
  }
});

module.exports = router;
