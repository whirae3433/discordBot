const { buildGuestStatusEmbed } = require('../../utils/buildGuestStatusEmbed');
const { getGuestListByDate } = require('../../pg/selectGuestList');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { safeReply } = require('../../utils/safeReply');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;
  const guild = interaction.guild;

  try {
    // 손님 목록 가져오기
    const grouped = await getGuestListByDate(serverId, 'from_today');

    if (!grouped || Object.keys(grouped).length === 0) {
      return safeReply(interaction, '❌ 등록된 손님이 없습니다.', {
        ephemeral: true,
        deleteAfter: 3000,
      });
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
      .setCustomId('select_guest_edit')
      .setPlaceholder('✏️ 수정할 손님을 선택하세요')
      .addOptions(allGuests.slice(0, 25));

    const cancelSelect = new StringSelectMenuBuilder()
      .setCustomId('select_guest_delete')
      .setPlaceholder('❌ 취소할 손님을 선택하세요')
      .addOptions(allGuests.slice(0, 25));

    const components = [
      new ActionRowBuilder().addComponents(editSelect),
      new ActionRowBuilder().addComponents(cancelSelect),
    ];

    return safeReply(
      interaction,
      {
        embeds,
        components,
      },
      {
        ephemeral: true,
        deleteAfter: 7000,
      }
    );
  } catch (err) {
    console.error('[손님 현황 버튼 오류]', err);

    return safeReply(
      interaction,
      '❌ 손님 정보를 불러오는 중 오류가 발생했습니다.',
      {
        ephemeral: true,
        deleteAfter: 3000,
      }
    );
  }
};
