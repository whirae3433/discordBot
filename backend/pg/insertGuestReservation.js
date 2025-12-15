const pool = require('./db');

async function insertGuestReservation({
  id,
  memberId,
  guestName,
  rank,
  referencePrice,
  discount,
  totalPrice,
  deposit,
  balance,
  serverId,
  date,
}) {
  const query = `
    INSERT INTO guest_list (
      id, member_id, guest_name, rank, reference_price, discount, total_price, deposit, balance, server_id, date
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *;
  `;

  const values = [
    id,
    memberId,
    guestName,
    rank,
    referencePrice,
    discount,
    totalPrice,
    deposit,
    balance,
    serverId,
    date,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = { insertGuestReservation };
