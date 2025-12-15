const { parseIntSafe } = require('../../utils/parseIntSafe');

/**
 * add/edit 공통 모달 입력값 읽기
 * mode: 'add' | 'edit'
 */
function readGuestFields(interaction, mode = 'add') {
  if (mode === 'edit') {
    // 수정 모달 구조
    return {
      date: interaction.fields.getTextInputValue('date')?.trim(),
      rank: parseIntSafe(interaction.fields.getTextInputValue('rank')),
      guestName: interaction.fields.getTextInputValue('guest_name')?.trim(),
      depositRaw: interaction.fields.getTextInputValue('deposit')?.trim(),
      discount: parseIntSafe(interaction.fields.getTextInputValue('discount')),
    };
  }

  // add 모달 구조
  return {
    guestName: interaction.fields.getTextInputValue('guest_name')?.trim(),
    date: interaction.fields.getTextInputValue('date')?.trim(),
    depositRaw: interaction.fields
      .getTextInputValue('deposit')
      ?.trim(),
    discount: parseIntSafe(
      interaction.fields.getTextInputValue('discount')?.trim() ?? '0'
    ),
  };
}

/**
 * 기준 금액 + 예약 충돌 체크
 * (edit에서만 사용. add는 충돌을 insert 시도 시 DB가 잡아줌)
 */
async function fetchBasePriceAndConflict(pool, serverId, rank, newId, oldId) {
  return Promise.all([
    pool.query(
      `
      SELECT amount 
      FROM amount_by_rank 
      WHERE server_id = $1 AND rank = $2
      `,
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
 * 기준 금액만 조회 (add에서 사용)
 */
async function fetchReferencePrice(pool, serverId, rank) {
  const res = await pool.query(
    `
    SELECT amount 
    FROM amount_by_rank 
    WHERE server_id = $1 AND rank = $2
    `,
    [serverId, rank]
  );
  return res.rows?.[0]?.amount ?? null;
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
 * 날짜 형식 검증
 */
function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * 할인 검증
 */
function validateDiscount(discount) {
  return Number.isFinite(discount) && discount >= 0;
}

/**
 * 공통 예약 정보 포맷
 */
function formatGuestInfo(g) {
  const format = (n) => Number(n || 0).toLocaleString();
  return [
    `🗓️ **${g.date} (${g.rank}순위)**`,
    `👤 **${g.guest_name}**`,
    ``,
    `💰 총액: ${format(g.total_price)} 메소`,
    `💸 예약금: ${format(g.deposit)} 메소`,
    `💳 잔금: ${format(g.balance)} 메소`,
    `📉 할인: ${format(g.discount)} 메소`,
  ].join('\n');
}

function buildGuestMessage(header, guestData) {
  return [`${header}`, ``, formatGuestInfo(guestData)].join('\n');
}

module.exports = {
  readGuestFields,
  fetchBasePriceAndConflict,
  fetchReferencePrice,
  computeDeposit,
  isValidDate,
  validateDiscount,
  formatGuestInfo,
  buildGuestMessage,
};
