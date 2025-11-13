const { MessageFlags } = require('discord-api-types/v10');
const { buildGuestStatusEmbed } = require('../../utils/buildGuestStatusEmbed');
const { getGuestListByDate } = require('../../pg/selectGuestList');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { deleteAfter } = require('../../utils/deleteAfter');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  try {
    // 손님 목록 가져오기
    const grouped = await getGuestListByDate(serverId, 'from_today');

    if (!grouped || Object.keys(grouped).length === 0) {
      await interaction.reply({
        content: '❌ 등록된 손님이 없습니다.',
        flags: MessageFlags.Ephemeral,
      });
      deleteAfter(interaction, 3000);
      return;
    }

    // Embed 생성
    const embeds = await buildGuestStatusEmbed(grouped, interaction.guild);

    // SelectMenus 생성
    const allGuests = Object.entries(grouped).flatMap(([date, guests]) =>
      guests.map((g) => ({
        label: `${date} | ${g.rank}순위 - ${g.guest_name}`,
        description: `금액: ${g.total_price.toLocaleString()} 메소 | 예약금: ${g.deposit.toLocaleString()} 메소`,
        value: g.id,
      }))
    );

    const editSelect = new StringSelectMenuBuilder()
      .setCustomId('select_edit_guest')
      .setPlaceholder('✏️ 수정할 손님을 선택하세요')
      .addOptions(allGuests.slice(0, 25));

    const cancelSelect = new StringSelectMenuBuilder()
      .setCustomId('select_delete_guest')
      .setPlaceholder('❌ 취소할 손님을 선택하세요')
      .addOptions(allGuests.slice(0, 25));

    const components = [
      new ActionRowBuilder().addComponents(editSelect),
      new ActionRowBuilder().addComponents(cancelSelect),
    ];

    // 이 버튼을 누른 사람만 볼 수 있게 (Ephemeral)
    await interaction.reply({
      embeds,
      components,
      flags: MessageFlags.Ephemeral,
    });

    // 선택 안 하면 7초 후 자동 삭제
    deleteAfter(interaction, 7000);
  } catch (err) {
    console.error('[손님 현황 에러]', err);

    await interaction.reply({
      content: '❌ 손님 정보를 불러오는 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });

    deleteAfter(interaction, 3000);
  }
};
