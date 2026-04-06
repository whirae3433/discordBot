const express = require('express');
const router = express.Router();
const pool = require('../../../pg/db');
const { requireLogin } = require('./_common');

// GET /timer/rooms/:roomId
router.get('/:roomId', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { roomId } = req.params;
  const client = await pool.connect();

  try {
    const roomRes = await client.query(
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

    if (roomRes.rowCount === 0) {
      return res.status(404).json({ message: 'room not found' });
    }

    const memRes = await client.query(
      `
      select role
      from timer_room_members
      where room_id = $1 and discord_id = $2 and left_at is null
      limit 1
      `,
      [roomId, discordId],
    );

    if (memRes.rowCount === 0) {
      return res.status(403).json({ message: 'Not a room member' });
    }

    return res.json({
      ...roomRes.rows[0],
      myRole: memRes.rows[0].role,
    });
  } catch (e) {
    console.error('[getRoomDetail] failed:', e);
    return res.status(500).json({ message: 'failed to fetch room' });
  } finally {
    client.release();
  }
});

module.exports = router;
