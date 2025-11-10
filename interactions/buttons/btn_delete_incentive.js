const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const { deleteAfter } = require('../../utils/deleteAfter');

module.exports = async (interaction) => {
  // customId: btn_delete_incentive_<id>
  const prefix = 'btn_delete_incentive_';
  const incentiveId = interaction.customId.startsWith(prefix)
    ? interaction.customId.slice(prefix.length)
    : interaction.customId;

    

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`btn_delete_incentive_confirm_${incentiveId}`)
      .setLabel('삭제하기')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`btn_delete_incentive_cancel`)
      .setLabel('취소하기')
      .setStyle(ButtonStyle.Secondary)
  );

  // 1. 메시지 전송
  await interaction.reply({
    content: `정말 삭제하시겠습니까?`,
    components: [row],
    flags: MessageFlags.Ephemeral,
  });

  // 2. Collector 생성 (7초 제한)
  const collector = interaction.channel.createMessageComponentCollector({
    filter: (i) =>
      i.user.id === interaction.user.id &&
      (i.customId === `btn_delete_incentive_confirm_${incentiveId}` ||
        i.customId === 'btn_delete_incentive_cancel'),
    time: 7000,
  });

  collector.on('collect', async (i) => {
    deleteAfter(interaction, 0); // ✅ 즉시 삭제
    collector.stop('clicked');
  });

  collector.on('end', async (collected, reason) => {
    if (reason !== 'clicked') {
      deleteAfter(interaction, 0); // 시간 종료 시 즉시 삭제
    }
  });
};