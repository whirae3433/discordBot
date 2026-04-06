const express = require('express');
const router = express.Router();
const pool = require('../../../pg/db');
const { requireLogin } = require('./_common');

// DELETE /timer/rooms/:roomId
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

    return res.json({ ok: true });
  } catch (e) {
    await client.query('rollback');
    console.error('[deleteRoom] failed:', e);
    return res.status(500).json({ message: 'failed to delete room' });
  } finally {
    client.release();
  }
});

module.exports = router;
