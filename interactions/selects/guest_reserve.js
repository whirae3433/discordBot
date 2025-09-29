const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = async (interaction) => {
  const rawValue = interaction.values[0]; // ex: 'rank1|1순위'

  if (rawValue === 'pick_date') {
    return interaction.reply({
      content: '📅 날짜 선택 기능은 준비 중입니다.',
      ephemeral: true,
    });
  }

  const [rankValue, rankLabel] = rawValue.split('|');

  const modal = new ModalBuilder()
    .setCustomId(`guest_input_${rankValue}`) // guest_input_rank1
    .setTitle(`손님 예약 - ${rankLabel}`); // 한글 label 사용

  const guestIdInput = new TextInputBuilder()
    .setCustomId('guest_id')
    .setLabel('손님의 인게임 ID를 입력하세요')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('예: 이케아')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(guestIdInput));

  await interaction.showModal(modal);
};
