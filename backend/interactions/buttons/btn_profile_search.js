const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = async (interaction) => {
  try {
    const modal = new ModalBuilder()
      .setCustomId('modal_profile_search')
      .setTitle('길드원 검색 🔎');

    const input = new TextInputBuilder()
      .setCustomId('search_nickname')
      .setLabel('검색할 닉네임을 입력하세요')
      .setPlaceholder('인게임 닉 또는 디스코드 닉네임')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    return interaction.showModal(modal);
  } catch (err) {
    console.error('[길드원 검색 버튼 오류]', err);
  }
};
