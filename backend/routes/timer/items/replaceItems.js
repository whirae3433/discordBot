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

    const role = await getRoomRole(client, roomId, discordId);
    if (!canManageSet(role, setKey)) {
      await client.query('rollback');
      return res.status(403).json({ message: 'You cannot edit this set' });
    }

    await client.query(
      `
      delete from timer_items
      where room_id = $1 and set_key = $2
      `,
      [String(roomId), setKey],
    );

    for (const it of cleaned) {
      await client.query(
        `
        insert into timer_items (
          room_id,
          set_key,
          title,
          duration_sec,
          created_by
        )
        values ($1, $2, $3, $4, $5)
        `,
        [String(roomId), setKey, it.title, it.durationSec, discordId],
      );
    }

    await client.query('commit');

    await emitRoomState(req, client, roomId);

    const payload = await buildRoomState(client, roomId)
    return res.json(payload);
  } catch (e) {
    await client.query('rollback');
    console.error('[replaceItems] failed:', e);
    return res.status(500).json({ message: 'failed to replace items' });
  } finally {
    client.release();
  }
});

module.exports = router;
