const { MessageFlags } = require('discord-api-types/v10');
const { buildGuestStatusEmbed } = require('../../utils/buildGuestStatusEmbed');
const { getGuestListByDate } = require('../../pg/selectGuestList');
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  try {
    // 손님 목록 가져오기
    const grouped = await getGuestListByDate(serverId);
    if (!grouped || Object.keys(grouped).length === 0) {
      return interaction.reply({
        content: '❌ 등록된 손님이 없습니다.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // Embed 생성
    const embeds = await buildGuestStatusEmbed(interaction, serverId);

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

    // 5초 후 자동 삭제 (선택 안 했을 경우)
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err) {
        // 이미 선택해서 모달 열었으면 무시
      }
    }, 5000);
  } catch (err) {
    console.error('[손님 현황 에러]', err);
    await interaction.reply({
      content: '❌ 손님 정보를 불러오는 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
  }
};
