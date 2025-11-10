const { MessageFlags } = require('discord-api-types/v10');
const { createRegisterEmbed } = require('../../utils/embedHelper');
const { deleteAfter } = require('../../utils/deleteAfter');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const userId = interaction.user.id;

  // 등록 안내 임베드 생성
  const embed = createRegisterEmbed(serverId, userId);

  await interaction.reply({
    embeds: [embed],
    flags: MessageFlags.Ephemeral,
  });

  deleteAfter(interaction, 7000);
}