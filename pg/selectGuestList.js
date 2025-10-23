const pool = require('./db');

async function getGuestListByDate(serverId) {
  const query = `
    SELECT
      raid_id,
      guest_name,
      rank,
      total_price
    FROM guest_list
    WHERE server_id = $1
      AND (
        (EXTRACT(HOUR FROM CURRENT_TIMESTAMP) < 2
          AND TO_DATE(LEFT(id, 10), 'YYYY-MM-DD') >= CURRENT_DATE - 1)
        OR
        (EXTRACT(HOUR FROM CURRENT_TIMESTAMP) >= 2
          AND TO_DATE(LEFT(id, 10), 'YYYY-MM-DD') >= CURRENT_DATE)
      )
    ORDER BY LEFT(id, 10) ASC, rank ASC;
  `;
  const values = [serverId];

  const res = await pool.query(query, values);

  // 그룹화: { '2025-10-21': [ ... ] }
  const grouped = {};
  for (const row of res.rows) {
    const date = row.raid_id.split('_')[0]; // ex) 2025-10-21
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(row);
  }

  return grouped;
}

module.exports = { getGuestListByDate };
