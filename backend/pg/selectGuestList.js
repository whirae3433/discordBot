const pool = require('./db');
const { getLogicalToday } = require('../utils/getLogicalToday');

/**
 * @param {string} serverId
 * @param {'today' | 'from_today'} mode
 */
async function getGuestListByDate(serverId, mode = 'today') {
  const logicalToday = getLogicalToday();

  let dateCondition = '';
  if (mode === 'today') {
    dateCondition = `date = $2`;
  } else if (mode === 'from_today') {
    dateCondition = `date >= $2`;
  }

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
      AND ${dateCondition}
    ORDER BY date ASC, rank ASC;
  `;
  const values = [serverId, logicalToday];
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
