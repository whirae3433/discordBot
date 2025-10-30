const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

const labelMap = {
  rank1: '🥇 1순위',
  rank2: '🥈 2순위',
  rank3: '🥉 3순위',
};

module.exports = async (interaction) => {
  try {
    const rankValue = interaction.values[0]; // 선택된 rank (rank1, rank2, rank3)
    const rankLabel = labelMap[rankValue] ?? '알 수 없음';

    const modal = new ModalBuilder()
      .setCustomId(`guest_input_${rankValue}`) // 모달 식별자 (index.js와 매칭됨)
      .setTitle(`${rankLabel} 손님 예약`);

    // ✅ 1. 날짜
    const today = new Date().toISOString().split('T')[0];
    const dateInput = new TextInputBuilder()
      .setCustomId('guest_date')
      .setLabel('날짜 ex.(2025-01-01)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    dateInput.setValue(today);

    // ✅ 2. 손님 이름
    const guestNameInput = new TextInputBuilder()
      .setCustomId('guest_id')
      .setLabel('손님 닉네임')
      .setPlaceholder('ex. 이케아')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    // ✅ 3. 예약금 상태
    const depositStatusInput = new TextInputBuilder()
      .setCustomId('guest_deposit_status')
      .setLabel('예약금 상태 (완납 / 1억 / 없음)')
      .setPlaceholder('정확히 (완납 / 1억 / 없음) 중 하나를 입력')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    // 할인 금액
    const discountInput = new TextInputBuilder()
      .setCustomId('discount')
      .setLabel('할인 ex: 10000000 (기본값 0)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue('0');

    modal.addComponents(
      new ActionRowBuilder().addComponents(dateInput),
      new ActionRowBuilder().addComponents(guestNameInput),
      new ActionRowBuilder().addComponents(depositStatusInput),
      new ActionRowBuilder().addComponents(discountInput)
    );

    // ✅ 모달 띄우기
    await interaction.showModal(modal);
  } catch (err) {
    console.error('[selectMenus/guest_reserve.js 오류]', err);
  }
};
