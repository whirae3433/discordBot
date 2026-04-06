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
      `
      select id, room_id, set_key, running
      from timer_items
      where id = $1
      `,
      [itemId],
    );

    if (itemRes.rowCount === 0) {
      await client.query('rollback');
      return res.status(404).json({ message: 'item not found' });
    }

    const { room_id: roomId, set_key: setKey, running } = itemRes.rows[0];

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

    return res.json(upd.rows[0]);
  } catch (e) {
    await client.query('rollback');
    console.error('[updateItem] failed:', e);
    return res.status(500).json({ message: 'failed to update item' });
  } finally {
    client.release();
  }
});

module.exports = router;
