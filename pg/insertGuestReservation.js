// pg/insertGuestReservation.js

const pool = require('./db');

async function insertGuestReservation({
  id,
  raidId,
  guestName,
  rank,
  referencePrice,
  discount,
  totalPrice,
  deposit,
  balance,
  serverId,
}) {
  const query = `
    INSERT INTO guest_reservations (
      id, raid_id, guest_name, rank, reference_price, discount, total_price, deposit, balance, server_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;

  const values = [
    id,
    raidId,
    guestName,
    rank,
    referencePrice,
    discount,
    totalPrice,
    deposit,
    balance,
    serverId,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = { insertGuestReservation };
