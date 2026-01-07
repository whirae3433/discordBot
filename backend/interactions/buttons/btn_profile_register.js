const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = async (interaction) => {
  const modal = new ModalBuilder()
    .setCustomId('modal_confirm_profile_redirect')
    .setTitle('외부 페이지 이동');

  const notice = new TextInputBuilder()
    .setCustomId('notice')
    .setLabel('안내')
    .setStyle(TextInputStyle.Paragraph)
    .setValue(
      '무영봇 웹 UI로 이동합니다.\n외부 브라우저가 열릴 수 있습니다.'
    )
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(notice)
  );

  await interaction.showModal(modal);
};
