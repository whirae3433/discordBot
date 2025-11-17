const { safeReply } = require('../../utils/safeReply');
const { getReferencePrice } = require('../../pg/getReferencePrice');
const { insertGuestReservation } = require('../../pg/insertGuestReservation');
const {
  updateGuestStatusChannel,
} = require('../../pg/updateGuestStatusChannel');

const {
  readGuestFields,
  isValidDate,
  validateDiscount,
  computeDeposit,
  buildGuestMessage,
} = require('./guest.helpers');

const labelMap = {
  rank1: '🥇 1순위',
  rank2: '🥈 2순위',
  rank3: '🥉 3순위',
};

module.exports = async (interaction) => {
  const serverId = interaction.guildId;
  const userId = interaction.user.id;

  // 순위 추출
  const rankValue = interaction.customId.replace('guest_add_', '');
  const rankLabel = labelMap[rankValue] ?? '알 수 없음';
  const rank = parseInt(rankValue.replace('rank', ''), 10);

  // 모달 입력값 읽기 (add 모드)
  const { guestName, date, depositRaw, discount } = readGuestFields(
    interaction,
    'add'
  );

  // 할인 검증
  if (!validateDiscount(discount)) {
    return safeReply(
      interaction,
      '⚠️ 할인 금액은 0 이상의 숫자로 입력해주세요.',
      {
        deleteAfter: 3000,
      }
    );
  }

  // 날짜 형식 검사
  if (!isValidDate(date)) {
    return safeReply(
      interaction,
      '⚠️ 날짜 형식이 올바르지 않습니다. 예: 2025-09-30',
      { deleteAfter: 3000 }
    );
  }

  const referencePrice = await getReferencePrice(rank, serverId);
  if (!referencePrice || isNaN(referencePrice)) {
    return safeReply(
      interaction,
      '❌ 해당 순위의 기준 금액을 불러오지 못했습니다.',
      { deleteAfter: 3000 }
    );
  }

  const totalPrice = Math.max(referencePrice - discount, 0);

  // 예약금 처리 (공통 함수 사용)
  let deposit = computeDeposit(depositRaw, totalPrice);
  if (deposit === null) {
    return safeReply(
      interaction,
      '⚠️ 예약금 상태는 반드시 "완납", "1억", "없음" 중 하나로 입력해주세요.',
      { deleteAfter: 3000 }
    );
  }

  deposit = Math.min(deposit, totalPrice);
  const balance = Math.max(totalPrice - deposit, 0);

  // ID / RAID_ID 생성
  const id = `${date}_${rank}`;
  const memberId = `${userId}`;

  try {
    // ✅ DB에 삽입 시도
    await insertGuestReservation({
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
    });

    // 성공 메시지 (공통 포맷 사용)
    const msg = buildGuestMessage('✅ **예약 완료!**', {
      date,
      rank,
      guest_name: guestName,
      total_price: totalPrice,
      deposit,
      balance,
      discount,
    });

    await safeReply(interaction, msg, {
      ephemeral: true,
      deleteAfter: 3000,
    });

    // 손님 현황 채널 갱신
    updateGuestStatusChannel(interaction.client, interaction.guildId, date);
  } catch (err) {
    console.error('[DB 저장 오류]', err);

    return safeReply(
      interaction,
      '❌ 해당 날짜의 해당 순위는 이미 예약되어 있습니다.',
      { deleteAfter: 3000 }
    );
  }
};
