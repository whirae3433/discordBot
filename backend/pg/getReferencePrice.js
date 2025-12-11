const pool = require('./db');

async function getReferencePrice(rank, serverId) {
  const query = `
    SELECT amount FROM amount_by_rank
    WHERE rank = $1 AND server_id = $2
  `;
  const values = [rank, serverId];

  const res = await pool.query(query, values);

  if (res.rows.length === 0) {
    throw new Error(`해당 rank (${rank}) / serverId (${serverId}) 에 대한 가격 정보를 찾을 수 없습니다.`);
  }

  return res.rows[0].amount;
}

module.exports = { getReferencePrice };
