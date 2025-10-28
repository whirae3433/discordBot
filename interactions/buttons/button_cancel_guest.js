const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonStyle,
} = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const { getGuestListByDate } = require('../../pg/selectGuestList');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  try {
    const grouped = await getGuestListByDate(serverId);
    if (Object.keys(grouped).length === 0) {
      return interaction.reply({
        content: '❌ 현재 예약된 손님이 없습니다.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('어떤 손님 예약을 취소하시겠어요?')
      .setColor(0xff5555);

    const allGuests = Object.entries(grouped).flatMap(([date, guests]) =>
      guests.map((g) => ({
        label: `${date} | ${g.rank}순위 - ${g.guest_name}`,
        description: `금액 ${g.total_price.toLocaleString()} 메소`,
        value: g.id,
      }))
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_delete_guest') // 삭제용 select
      .setPlaceholder('삭제할 손님을 선택하세요')
      .addOptions(allGuests.slice(0, 25));

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: MessageFlags.None,
    });
  } catch (err) {
    console.error('[예약 취소 목록 오류]', err);
    await interaction.reply({
      content: '❌ 예약 목록을 불러오는 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
  }
};
