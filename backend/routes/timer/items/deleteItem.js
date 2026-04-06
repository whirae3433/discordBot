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
      `
      select id, room_id, set_key
      from timer_items
      where id = $1
      `,
      [itemId],
    );

    if (itemRes.rowCount === 0) {
      await client.query('rollback');
      return res.status(404).json({ message: 'item not found' });
    }

    const { room_id: roomId, set_key: setKey } = itemRes.rows[0];

    const open = await assertRoomOpen(client, roomId);
    if (!open) {
      await client.query('rollback');
      return res.status(404).json({ message: 'room not found' });
    }

    const role = await getRoomRole(client, roomId, discordId);
    if (!canManageSet(role, setKey)) {
      await client.query('rollback');
      return res.status(403).json({ message: 'You cannot delete this set' });
    }

    await client.query(`delete from timer_items where id = $1`, [itemId]);

    await client.query('commit');

    await emitRoomState(req, client, roomId);

    return res.json({ ok: true, itemId });
  } catch (e) {
    await client.query('rollback');
    console.error('[deleteItem] failed:', e);
    return res.status(500).json({ message: 'failed to delete item' });
  } finally {
    client.release();
  }
});

module.exports = router;
