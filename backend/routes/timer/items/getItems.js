const express = require('express');
const router = express.Router();
const pool = require('../../../pg/db');
const { validate: isUuid } = require('uuid');
const { buildRoomState } = require('../../../services/timer/buildRoomState');

// 공통 함수들 필요하면 따로 utils로 빼도 됨
function requireLogin(req, res) {
  const discordId = req.user?.discord_id;
  if (!discordId) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  return String(discordId);
}

async function assertRoomMember(client, roomId, discordId) {
  const r = await client.query(
    `
    select 1
    from timer_room_members
    where room_id = $1 and discord_id = $2 and left_at is null
    limit 1
    `,
    [roomId, discordId],
  );
  return r.rowCount > 0;
}

router.get('/', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const { roomId } = req.query;
  if (!roomId || !isUuid(roomId)) {
    return res.status(400).json({ message: 'roomId(uuid) required' });
  }

  const client = await pool.connect();
  try {
    const ok = await assertRoomMember(client, roomId, discordId);
    if (!ok) return res.status(403).json({ message: 'Not a room member' });

    const payload = await buildRoomState(client, roomId)
    res.json(payload);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'failed to fetch items' });
  } finally {
    client.release();
  }
});

module.exports = router;
