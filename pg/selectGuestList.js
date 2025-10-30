const pool = require('./db');
const { DateTime } = require('luxon');

async function getGuestListByDate(serverId) {
  const nowKST = DateTime.now().setZone('Asia/Seoul');
  const targetDate =
    nowKST.hour < 2
      ? nowKST.minus({ days: 1 }).toISODate()
      : nowKST.toISODate();

  const query = `
    SELECT
      id,
      raid_id,
      guest_name,
      rank,
      total_price,
      deposit,
      balance
    FROM guest_list
    WHERE server_id = $1
      AND TO_DATE(LEFT(id, 10), 'YYYY-MM-DD') >= $2
    ORDER BY LEFT(id, 10) ASC, rank ASC;
  `;
  const values = [serverId, targetDate];
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
