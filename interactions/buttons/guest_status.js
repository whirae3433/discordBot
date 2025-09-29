const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = async (interaction) => {
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('guest_reserve')
      .setPlaceholder('예약할 순위를 선택하세요')
      .addOptions([
        { label: '1순위', value: 'rank1|1순위' },
        { label: '2순위', value: 'rank2|2순위' },
        { label: '3순위', value: 'rank3|3순위' },
        { label: '날짜 선택', value: 'pick_date' },
      ])
  );

  await interaction.reply({
    content: '💰 손님 예약 메뉴입니다.',
    components: [row],
    ephemeral: true,
  });
};
