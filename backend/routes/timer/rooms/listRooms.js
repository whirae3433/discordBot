const express = require('express');
const router = express.Router();
const pool = require('../../../pg/db');
const { requireLogin } = require('./_common');

// GET /timer/rooms
router.get('/', async (req, res) => {
  const discordId = requireLogin(req, res);
  if (!discordId) return;

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `
      select
        r.id as "roomId",
        r.name,
        r.is_private as "isPrivate",
        r.created_at as "createdAt",
        r.owner_discord_id as "ownerDiscordId",
        owner.owner_name as "ownerName",
        m.role as "myRole",
        case
          when m.discord_id is not null then true
          else false
        end as "isJoined"
      from timer_rooms r
      left join timer_room_members m
        on m.room_id = r.id
       and m.discord_id = $1
       and m.left_at is null
      left join (
        select
          discord_id,
          max(discord_name) as owner_name
        from members
        group by discord_id
      ) owner
        on owner.discord_id = r.owner_discord_id
      where r.closed_at is null
      order by r.created_at desc
      `,
      [discordId],
    );

    return res.json({ rooms: rows });
  } catch (e) {
    console.error('[listRooms] failed:', e);
    return res.status(500).json({ message: 'failed to list rooms' });
  } finally {
    client.release();
  }
});

module.exports = router;
