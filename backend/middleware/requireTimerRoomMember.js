const pool = require('../pg/db');

// req.user.discord_id를 전제로 함
function requireLogin(req, res) {
  const discordId = req.user?.discord_id;
  if (!discordId) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  return String(discordId);
}

async function isRoomOpen(client, roomId) {
  const { rowCount } = await client.query(
    `
    select 1
    from timer_rooms
    where id = $1 and closed_at is null
    limit 1
    `,
    [String(roomId)],
  );
  return rowCount > 0;
}

async function isRoomMember(client, roomId, discordId) {
  const { rowCount } = await client.query(
    `
    select 1
    from timer_room_members
    where room_id = $1
      and discord_id = $2
      and left_at is null
    limit 1
    `,
    [String(roomId), String(discordId)],
  );
  return rowCount > 0;
}

/**
 * replace 용: body.roomId 기반 멤버 체크
 */
function requireTimerRoomMemberByBodyRoomId() {
  return async (req, res, next) => {
    const discordId = requireLogin(req, res);
    if (!discordId) return;

    const roomId = req.body?.roomId;
    if (!roomId) return res.status(400).json({ message: 'roomId required' });

    const client = await pool.connect();
    try {
      const open = await isRoomOpen(client, roomId);
      if (!open) return res.status(404).json({ message: 'room not found' });

      const ok = await isRoomMember(client, roomId, discordId);
      if (!ok) return res.status(403).json({ message: 'Not a room member' });

      // downstream에서 roomId 재활용 가능
      req._timerRoomId = String(roomId);
      next();
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'member check failed' });
    } finally {
      client.release();
    }
  };
}

/**
 * start/stop 용: params.itemId → timer_items에서 room_id 조회 → 멤버 체크
 */
function requireTimerRoomMemberByItemId(paramName = 'itemId') {
  return async (req, res, next) => {
    const discordId = requireLogin(req, res);
    if (!discordId) return;

    const itemId = req.params?.[paramName];
    if (!itemId) return res.status(400).json({ message: 'itemId required' });

    const client = await pool.connect();
    try {
      const itemRes = await client.query(
        `
        select room_id as "roomId"
        from timer_items
        where id = $1
        limit 1
        `,
        [itemId],
      );

      if (itemRes.rowCount === 0) {
        return res.status(404).json({ message: 'item not found' });
      }

      const roomId = String(itemRes.rows[0].roomId);

      const open = await isRoomOpen(client, roomId);
      if (!open) return res.status(404).json({ message: 'room not found' });

      const ok = await isRoomMember(client, roomId, discordId);
      if (!ok) return res.status(403).json({ message: 'Not a room member' });

      req._timerRoomId = roomId;
      next();
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'member check failed' });
    } finally {
      client.release();
    }
  };
}

module.exports = {
  requireTimerRoomMemberByBodyRoomId,
  requireTimerRoomMemberByItemId,
};