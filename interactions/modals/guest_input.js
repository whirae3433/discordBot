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
  const rank = parseInt(rankValue.replace('rank', ''), 10); // 숫자만 추출

  const guestId = interaction.fields.getTextInputValue('guest_id');
  const date = interaction.fields.getTextInputValue('guest_date');

  // ✅ 날짜 형식 검증 (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    const reply = await interaction.reply({
      content: '⚠️ 날짜 형식이 올바르지 않습니다. 예: 2025-09-30',
      flags: MessageFlags.Ephemeral,
    });

    // 5초 뒤 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err) {
        console.error('삭제 실패:', err);
      }
    }, 5000);
    return;
  }

  // 💰 가격 계산 로직
  const referencePrice = await getReferencePrice(rank, serverId);
  const discount = false; // 현재는 항상 false
  const totalPrice = referencePrice;
  const deposit = 100000000;
  const balance = totalPrice - deposit;

  // 🆔 예약 식별자들
  const id = `${date}_${rank}`;
  const raidId = `${date}_${userId}`;

  try {
    const saved = await insertGuestReservation({
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
      content: `✅ 손님 **${guestId}** (${rankLabel}) 예약 완료!\n🗓️ 날짜: **${date}**\n💰 총액: ${totalPrice.toLocaleString()} / 💵 예약금: ${deposit.toLocaleString()} / 잔금: ${balance.toLocaleString()}`,
      flags: MessageFlags.Ephemeral,
    });

    // 5초 뒤 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err) {
        console.error('삭제 실패:', err);
      }
    }, 5000);
  } catch (err) {
    console.error('[DB 저장 오류]', err);
    await interaction.reply({
      content: '❌ 해당 날짜의 순위는 이미 마감되었습니다',
      flags: MessageFlags.Ephemeral,
    });

    // 오류 메시지도 5초 뒤 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err) {
        console.error('삭제 실패:', err);
      }
    }, 5000);
  }
};
