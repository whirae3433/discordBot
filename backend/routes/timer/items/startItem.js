const express = require('express');
const router = express.Router();
const pool = require('../../../pg/db');
const { buildRoomState } = require('../../../services/timer/buildRoomState');
const {
  isUuid,
  requireLogin,
  assertRoomMember,
  getRoomRole,
  canManageSet,
  assertRoomOpen,
} = require('./_common');

async function emitRoomState(req, client, roomId) {
  const io = req.app.get('io') || global.io;
  if (!io) return;
  const payload = await buildRoomState(client, roomId);
  io.to(String(roomId)).emit('room:state', payload);
}

router.post('/:itemId/start', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { itemId } = req.params;
  if (!isUuid(itemId)) {
    return res.status(400).json({ message: 'invalid itemId' });
  }

  const client = await pool.connect();
  try {
    await client.query('begin');

    const r = await client.query(
      `select room_id, duration_sec, set_key from timer_items where id = $1`,
      [itemId],
    );
    if (!r.rows.length) throw new Error('item not found');

    const {
      room_id: roomId,
      duration_sec: durationSec,
      set_key: setKey,
    } = r.rows[0];

    const isOpen = await assertRoomOpen(client, roomId);
    if (!isOpen) {
      return res.status(403).json({ message: 'room is closed' });
    }

    const isMember = await assertRoomMember(client, roomId, discordId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not a room member' });
    }

    const role = await getRoomRole(client, roomId, discordId);
    if (!canManageSet(role, setKey)) {
      return res.status(403).json({ message: 'No permission for this set' });
    }

    const startedAt = new Date();
    const endsAt =
      durationSec > 0
        ? new Date(startedAt.getTime() + durationSec * 1000)
        : null;

    await client.query(
      `
      update timer_items
      set running = true,
          started_at = $2,
          ends_at = $3,
          updated_at = now()
      where id = $1
      `,
      [itemId, startedAt, endsAt],
    );

    await client.query('commit');
    await emitRoomState(req, client, roomId);

    res.json({ ok: true });
  } catch (e) {
    await client.query('rollback');
    console.error(e);
    res.status(500).json({ message: 'start failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
