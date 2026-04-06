const pool = require('../../pg/db');

async function buildRoomState(clientOrRoomId, maybeRoomId) {
  const client = maybeRoomId ? clientOrRoomId : pool;
  const roomId = maybeRoomId ? maybeRoomId : clientOrRoomId;

  const itemsRes = await client.query(
    `
    select
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
    from timer_items
    where room_id = $1
    order by created_at asc
    `,
    [String(roomId)],
  );

  const settingsRes = await client.query(
    `
    select
      set_key as "setKey",
      auto_repeat as "autoRepeat"
    from timer_set_settings
    where room_id = $1
    `,
    [String(roomId)],
  );

  const autoRepeatBySet = {};
  for (const row of settingsRes.rows) {
    autoRepeatBySet[row.setKey] = row.autoRepeat;
  }

  const roomRes = await client.query(
    `
    select name
    from timer_rooms
    where id = $1
    limit 1
    `,
    [String(roomId)],
  );

  return {
    roomId: String(roomId),
    name: roomRes.rows[0]?.name ?? null,
    items: itemsRes.rows,
    autoRepeatBySet,
    serverTime: new Date().toISOString(),
  };
}

module.exports = { buildRoomState };
