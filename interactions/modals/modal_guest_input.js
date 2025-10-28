const { MessageFlags } = require('discord-api-types/v10');
const { getReferencePrice } = require('../../pg/getReferencePrice');
const { insertGuestReservation } = require('../../pg/insertGuestReservation');

const labelMap = {
  rank1: '🥇 1순위',
  rank2: '🥈 2순위',
  rank3: '🥉 3순위',
};

module.exports = async (interaction) => {
  const serverId = interaction.guildId;
  const userId = interaction.user.id;

  const rankValue = interaction.customId.replace('guest_input_', '');
  const rankLabel = labelMap[rankValue] ?? '알 수 없음';
  const rank = parseInt(rankValue.replace('rank', ''), 10);

  const guestId = interaction.fields.getTextInputValue('guest_id')?.trim();
  const date = interaction.fields.getTextInputValue('guest_date')?.trim();
  const status = interaction.fields
    .getTextInputValue('guest_deposit_status')
    ?.trim();
  const discountRaw =
    interaction.fields.getTextInputValue('discount')?.trim() ?? '0';

  // ✅ 할인 금액 숫자 파싱
  const discount = parseInt(discountRaw.replace(/[,]/g, ''), 10);
  if (isNaN(discount) || discount < 0) {
    return interaction.reply({
      content: '⚠️ 할인 금액은 0 이상의 숫자로 입력해주세요.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return interaction.reply({
      content: '⚠️ 날짜 형식이 올바르지 않습니다. 예: 2025-09-30',
      flags: MessageFlags.Ephemeral,
    });
  }

  // ✅ 기본 금액 조회
  const referencePrice = await getReferencePrice(rank, serverId);
  const totalPrice = Math.max(referencePrice - discount, 0);

  let deposit;
  if (status === '완납') deposit = totalPrice;
  else if (status === '1억') deposit = 100000000;
  else if (status === '없음') deposit = 0;
  else {
    return interaction.reply({
      content:
        '⚠️ 예약금 상태는 반드시 "완납", "1억", "없음" 중 하나로 입력해주세요.',
      flags: MessageFlags.Ephemeral,
    });
  }

  const balance = totalPrice - deposit;
  const id = `${date}_${rank}`;
  const raidId = `${date}_${userId}`;

  try {
    await insertGuestReservation({
      id,
      raidId,
      guestName: guestId,
      rank,
      referencePrice,
      discount,
      totalPrice,
      deposit,
      balance,
      serverId,
    });

    await interaction.reply({
      content: `✅ 손님 **${guestId}** (${rankLabel}) 예약 완료!\n🗓️ ${date}\n💰 총액: ${totalPrice.toLocaleString()} / 예약금: ${deposit.toLocaleString()} / 잔금: ${balance.toLocaleString()}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (err) {
    console.error('[DB 저장 오류]', err);
    await interaction.reply({
      content: '❌ 해당 날짜의 순위는 이미 마감되었습니다.',
      flags: MessageFlags.Ephemeral,
    });
  }
};
