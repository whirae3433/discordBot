const pool = require('./db');
const { DateTime } = require('luxon');

async function getGuestListByDate(serverId) {
  const nowKST = DateTime.now().setZone('Asia/Seoul');
  const targetDate = nowKST.toISODate();
  const query = `
    SELECT
      id,
      member_id,
      guest_name,
      rank,
      total_price,
      deposit,
      balance,
      date
    FROM guest_list
    WHERE server_id = $1
      AND date >= $2
    ORDER BY date ASC, rank ASC;
  `;
  const values = [serverId, targetDate];
  const res = await pool.query(query, values);

  // 그룹화: { '2025-10-21': [ ... ] }
  const grouped = {};
  for (const row of res.rows) {
    const date = row.date?.toISOString?.().slice(0, 10) || row.date; 
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(row);
  }

  return grouped;
}

module.exports = { getGuestListByDate };
