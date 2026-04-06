const { validate: isUuid } = require('uuid');

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

async function getRoomRole(client, roomId, discordId) {
  const r = await client.query(
    `
    select role
    from timer_room_members
    where room_id = $1 and discord_id = $2 and left_at is null
    limit 1
    `,
    [roomId, discordId],
  );
  return r.rows[0]?.role || null;
}

function canManageSet(role, setKey) {
  if (role === 'owner') return true;
  if (setKey === 't2' || setKey === 't3') return true;
  return false;
}

async function assertRoomOpen(client, roomId) {
  const r = await client.query(
    `select closed_at from timer_rooms where id = $1`,
    [roomId],
  );
  if (!r.rows.length) return false;
  return !r.rows[0].closed_at;
}

module.exports = {
  isUuid,
  requireLogin,
  assertRoomMember,
  getRoomRole,
  canManageSet,
  assertRoomOpen,
};
