const { parseIntSafe } = require('../../utils/parseIntSafe');

/**
 * 모달 입력값을 읽고 가공
 */
function readGuestEditFields(interaction) {
  return {
    date: interaction.fields.getTextInputValue('date')?.trim(),
    rank: parseIntSafe(interaction.fields.getTextInputValue('rank')),
    guestName: interaction.fields.getTextInputValue('guest_name')?.trim(),
    depositRaw: interaction.fields.getTextInputValue('deposit')?.trim(),
    discount: parseIntSafe(interaction.fields.getTextInputValue('discount')),
  };
}

/**
 * 기본 금액 조회 + 충돌 예약 체크 (병렬로 처리)
 */
async function fetchBasePriceAndConflict(pool, serverId, rank, newId, oldId) {
  return Promise.all([
    pool.query(
      `SELECT amount FROM amount_by_rank WHERE server_id = $1 AND rank = $2`,
      [serverId, rank]
    ),
    pool.query(
      `
      SELECT 1
      FROM guest_list
      WHERE server_id = $1
        AND id = $2
        AND id != $3
      `,
      [serverId, newId, oldId]
    ),
  ]);
}

/**
 * 예약금 계산 (문자 → 숫자 변환)
 * 실패하면 null 반환
 */
function computeDeposit(depositRaw, totalPrice) {
  switch (depositRaw) {
    case '완납':
      return totalPrice;
    case '없음':
      return 0;
    case '1억':
      return 100000000;
    default:
      return null;
  }
}

/**
 * 성공 메시지 생성
 */
function buildSuccessMessage(g) {
  const format = (n) => Number(n || 0).toLocaleString();
  return [
    `✅ **예약 수정 완료!**`,
    ``,
    `🗓️ **${g.date} (${g.rank}순위)**`,
    `👤 **${g.guest_name}**`,
    ``,
    `💰 총액: ${format(g.total_price)} 메소`,
    `💸 예약금: ${format(g.deposit)} 메소`,
    `💳 잔금: ${format(g.balance)} 메소`,
    `📉 할인: ${format(g.discount)} 메소`,
  ].join('\n');
}

module.exports = {
  readGuestEditFields,
  fetchBasePriceAndConflict,
  computeDeposit,
  buildSuccessMessage,
};
