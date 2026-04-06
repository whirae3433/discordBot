const express = require('express');
const router = express.Router();
const pool = require('../../../pg/db');
const { buildRoomState } = require('../../../services/timer/buildRoomState');
const {
  isUuid,
  requireLogin,
  getRoomRole,
  canManageSet,
  assertRoomOpen,
} = require('./_common');

async function emitRoomState(req, client, roomId) {
  const io = req.app.get('io') || global.io;
  if (!io) return;

  const payload = await buildRoomState(client, roomId)
  io.to(String(roomId)).emit('room:state', payload);
}

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

    const role = await getRoomRole(client, roomId, discordId);
    if (!canManageSet(role, setKey)) {
      await client.query('rollback');
      return res.status(403).json({ message: 'You cannot create in this set' });
    }

    const ins = await client.query(
      `
      insert into timer_items (
        room_id,
        set_key,
        title,
        duration_sec,
        created_by
      )
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
      [String(roomId), setKey, String(title).trim(), dur, discordId],
    );

    await client.query('commit');

    await emitRoomState(req, client, roomId);

    return res.status(201).json(ins.rows[0]);
  } catch (e) {
    await client.query('rollback');
    console.error('[createItem] failed:', e);
    return res.status(500).json({ message: 'failed to create item' });
  } finally {
    client.release();
  }
});

module.exports = router;
