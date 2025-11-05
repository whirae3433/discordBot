const { MessageFlags } = require('discord-api-types/v10');
const { getReferencePrice } = require('../../pg/getReferencePrice');
const { insertGuestReservation } = require('../../pg/insertGuestReservation');
const {
  updateGuestStatusChannel,
} = require('../../pg/updateGuestStatusChannel');

const labelMap = {
  rank1: '🥇 1순위',
  rank2: '🥈 2순위',
  rank3: '🥉 3순위',
};

module.exports = async (interaction) => {
  const serverId = interaction.guildId;
  const userId = interaction.user.id;

  // 순위 추출
  const rankValue = interaction.customId.replace('guest_input_', '');
  const rankLabel = labelMap[rankValue] ?? '알 수 없음';
  const rank = parseInt(rankValue.replace('rank', ''), 10);

  // 모달 입력값 읽기
  const guestName = interaction.fields.getTextInputValue('guest_id')?.trim();
  const date = interaction.fields.getTextInputValue('guest_date')?.trim();
  const status = interaction.fields
    .getTextInputValue('guest_deposit_status')
    ?.trim();
  const discountRaw =
    interaction.fields.getTextInputValue('discount')?.trim() ?? '0';

  // 숫자 파싱 유틸
  const parseIntSafe = (v, def = 0) => {
    if (v === null || v === undefined) return def;
    const str = String(v).replace(/[,]/g, '').trim();
    const n = parseInt(str, 10);
    return Number.isFinite(n) && n >= 0 ? n : def;
  };

  const discount = parseIntSafe(discountRaw);
  if (isNaN(discount) || discount < 0) {
    await interaction.reply({
      content: '⚠️ 할인 금액은 0 이상의 숫자로 입력해주세요.',
      flags: MessageFlags.Ephemeral,
    });
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
    return;
  }

  // 날짜 형식 검사
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    await interaction.reply({
      content: '⚠️ 날짜 형식이 올바르지 않습니다. 예: 2025-09-30',
      flags: MessageFlags.Ephemeral,
    });
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
    return;
  }

  // 기준 금액 조회
  const referencePrice = await getReferencePrice(rank, serverId);
  if (!referencePrice || isNaN(referencePrice)) {
    await interaction.reply({
      content: '❌ 해당 순위의 기준 금액을 불러오지 못했습니다.',
      flags: MessageFlags.Ephemeral,
    });
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
    return;
  }

  const totalPrice = Math.max(referencePrice - discount, 0);

  // 예약금 처리
  let deposit;
  if (status === '완납') deposit = totalPrice;
  else if (status === '1억') deposit = 100000000;
  else if (status === '없음') deposit = 0;
  else {
    await interaction.reply({
      content:
        '⚠️ 예약금 상태는 반드시 "완납", "1억", "없음" 중 하나로 입력해주세요.',
      flags: MessageFlags.Ephemeral,
    });
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
    return;
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
      date
    });

    // ✅ 성공 메시지
    const format = (n) => n.toLocaleString();

    await interaction.reply({
      content: [
        `✅ **예약 완료!**`,
        '',
        `🗓️ **${date} (${rankLabel})**`,
        `👤 **${guestName}**`,
        '',
        `💰 총액: ${format(totalPrice)} 메소`,
        `💸 예약금: ${format(deposit)} 메소`,
        `💳 잔금: ${format(balance)} 메소`,
        `📉 할인: ${format(discount)} 메소`,
      ].join('\n'),
      flags: MessageFlags.Ephemeral,
    });
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);

    updateGuestStatusChannel(interaction.client, interaction.guildId, date);
  } catch (err) {
    console.error('[DB 저장 오류]', err);
    await interaction.reply({
      content: '❌ 해당 날짜의 해당 순위는 이미 예약되어 있습니다.',
      flags: MessageFlags.Ephemeral,
    });
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
  }
};
