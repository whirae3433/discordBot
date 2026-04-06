const express = require('express');
const router = express.Router();
const pool = require('../../../pg/db');
const { buildRoomState } = require('../../../services/timer/buildRoomState');
const {
  isUuid,
  requireLogin,
  getRoomRole,
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

  const { roomId, setKey, autoRepeat } = req.body || {};

  if (!roomId || !isUuid(roomId)) {
    return res.status(400).json({ message: 'roomId(uuid) required' });
  }

  if (!setKey || typeof setKey !== 'string') {
    return res.status(400).json({ message: 'setKey required' });
  }

  if (typeof autoRepeat !== 'boolean') {
    return res.status(400).json({ message: 'autoRepeat(boolean) required' });
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
    if (!role) {
      await client.query('rollback');
      return res.status(403).json({ message: 'Not a room member' });
    }

    await client.query(
      `
      insert into timer_set_settings (
        room_id,
        set_key,
        auto_repeat,
        updated_at
      )
      values ($1, $2, $3, now())
      on conflict (room_id, set_key)
      do update set
        auto_repeat = excluded.auto_repeat,
        updated_at = now()
      `,
      [String(roomId), setKey, autoRepeat],
    );

    await client.query('commit');

    await emitRoomState(req, client, roomId);

    return res.json({ ok: true });
  } catch (e) {
    await client.query('rollback');
    console.error('[autoRepeat] failed:', e);
    return res.status(500).json({ message: 'failed to update auto repeat' });
  } finally {
    client.release();
  }
});

module.exports = router;
