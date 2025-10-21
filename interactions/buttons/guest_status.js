const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');


module.exports = async (interaction) => {
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('guest_reserve')
      .setPlaceholder('예약할 순위를 선택하세요')
      .addOptions([
        { label: '🥇 1순위', value: 'rank1' },
        { label: '🥈 2순위', value: 'rank2' },
        { label: '🥉 3순위', value: 'rank3' },
      ])
  );

  await interaction.reply({
    content: '📝 순위를 선택해주세요.',
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
};
