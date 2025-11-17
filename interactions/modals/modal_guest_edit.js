const { MessageFlags } = require('discord-api-types/v10');
const { safeReply } = require('../../utils/safeReply');
const { parseIntSafe } = require('../../utils/parseIntSafe');

const {
  safeUpdateGuestStatusChannel,
} = require('../../pg/updateGuestStatusChannel');
const pool = require('../../pg/db');

const {
  readGuestFields,
  fetchBasePriceAndConflict,
  computeDeposit,
  validateDiscount,
  buildGuestMessage,
} = require('./guest.helpers');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;
  const prefix = 'modal_guest_edit_';
  const oldId = interaction.customId.replace(prefix, '');
  const discordId = interaction.user.id;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    // 입력값 읽기
    const { date, rank, guestName, depositRaw, discount } = readGuestFields(
      interaction,
      'edit'
    );

    // 검증
    if (!date || !rank || rank < 1 || rank > 3) {
      return safeReply(interaction, '❌ 날짜/순위 입력 오류', {
        deleteAfter: 3000,
      });
    }

    // 할인 검증 추가
    if (!validateDiscount(discount)) {
      return safeReply(
        interaction,
        '⚠️ 할인 금액은 0 이상의 숫자로 입력해주세요.',
        { deleteAfter: 3000 }
      );
    }

    const newId = `${date}_${rank}`;

    // 기본 금액 및 중복 체크
    const [baseRes, conflictCheck] = await fetchBasePriceAndConflict(
      pool,
      serverId,
      rank,
      newId,
      oldId
    );

    if (baseRes.rowCount === 0) {
      return safeReply(
        interaction,
        '❌ 해당 순위 금액이 설정되지 않았습니다.',
        {
          deleteAfter: 3000,
        }
      );
    }
    if (conflictCheck.rowCount > 0) {
      return safeReply(interaction, `❌ ${date}의 ${rank}순위는 이미 예약됨`, {
        deleteAfter: 3000,
      });
    }

    const basePrice = parseIntSafe(baseRes.rows[0].amount);
    const totalPrice = Math.max(basePrice - discount, 0);

    // 예약금 계산
    let deposit = computeDeposit(depositRaw, totalPrice);
    if (deposit === null) {
      return safeReply(
        interaction,
        `❌ 예약금은 "완납", "없음", "1억" 중 하나만 입력 가능`,
        { deleteAfter: 3000 }
      );
    }

    deposit = Math.min(deposit, totalPrice);
    const balance = totalPrice - deposit;

    // DB 업데이트
    const updateRes = await pool.query(
      `
      UPDATE guest_list
        SET id = $1, member_id = $2, guest_name = $3, rank = $4,
            discount = $5, total_price = $6, deposit = $7,
            balance = $8, date = $9
      WHERE server_id = $10 AND id = $11
      RETURNING *;
    `,
      [
        newId,
        discordId,
        guestName,
        rank,
        discount,
        totalPrice,
        deposit,
        balance,
        date,
        serverId,
        oldId,
      ]
    );

    if (updateRes.rowCount === 0) {
      return safeReply(interaction, '❌ 수정 대상 손님을 찾을 수 없습니다.', {
        deleteAfter: 3000,
      });
    }

    const updated = updateRes.rows[0];

    // 성공 메시지
    safeReply(
      interaction,
      buildGuestMessage('✅ **예약 수정 완료!**', updated),
      { deleteAfter: 3000 }
    );

    // 현황 갱신 → 비동기
    safeUpdateGuestStatusChannel(interaction.client, serverId, {
      date: updated.date,
    });
  } catch (err) {
    console.error('[예약 수정 오류]', err);
    safeReply(interaction, '❌ 수정 중 오류가 발생했습니다.', {
      deleteAfter: 3000,
    });
  }
};
