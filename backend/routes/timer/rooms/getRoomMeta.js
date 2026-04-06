const express = require('express');
const router = express.Router();
const pool = require('../../../pg/db');
const { requireLogin } = require('./_common');

// GET /timer/rooms/:roomId/meta
router.get('/:roomId/meta', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { roomId } = req.params;
  const client = await pool.connect();

  try {
    const { rows, rowCount } = await client.query(
      `
      select
        id as "roomId",
        name,
        is_private as "isPrivate",
        created_at as "createdAt"
      from timer_rooms
      where id = $1 and closed_at is null
      `,
      [roomId],
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'room not found' });
    }

    return res.json(rows[0]);
  } catch (e) {
    console.error('[getRoomMeta] failed:', e);
    return res.status(500).json({ message: 'failed to fetch room meta' });
  } finally {
    client.release();
  }
});

module.exports = router;
