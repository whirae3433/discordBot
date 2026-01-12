const pool = require('../pg/db');

// bot_admins(서버 관리자) OR super_admin(봇 제작자)
async function ensureAdmin(serverId, userId) {
  const { rowCount } = await pool.query(
    `
    SELECT 1
    WHERE 
      EXISTS (
        SELECT 1
        FROM bot_admins
        WHERE server_id = $1
          AND discord_id = $2
      )
      OR EXISTS (
        SELECT 1
        FROM super_admin
        WHERE discord_id = $2
      )
    `,
    [serverId, userId]
  );

  return rowCount > 0;
}

module.exports = { ensureAdmin };
