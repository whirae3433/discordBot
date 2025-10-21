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
  const rankValue = interaction.values[0];
  const rankLabel = labelMap[rankValue] ?? '알 수 없음';

  const modal = new ModalBuilder()
    .setCustomId(`guest_input_${rankValue}`) // guest_input_rank1
    .setTitle(`손님 예약 - ${rankLabel}`); // 한글 label 사용

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const dateInput = new TextInputBuilder()
    .setCustomId('guest_date')
    .setLabel('예약 날짜를 입력하세요. 형식: 2025-09-30')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('예: 2025-09-30')
    .setValue(today) // 기본값 설정
    .setRequired(true);

  const guestIdInput = new TextInputBuilder()
    .setCustomId('guest_id')
    .setLabel('손님의 인게임 ID를 입력하세요')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('예: 이케아')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(dateInput),
    new ActionRowBuilder().addComponents(guestIdInput)
  );

  await interaction.showModal(modal);
};
