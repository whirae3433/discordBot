const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const { getGuestListByDate } = require('../../pg/selectGuestList');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  try {
    const grouped = await getGuestListByDate(serverId);

    if (Object.keys(grouped).length === 0) {
      await interaction.reply({
        content: '❌ 등록된 손님이 없습니다.',
        flags: MessageFlags.Ephemeral,
      });

      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (err) {
          console.error('[메시지 삭제 실패]', err);
        }
      }, 5000);

      return;
    }

    // ✅ Embed 생성
    const embed = new EmbedBuilder()
      .setTitle('📋 손님 예약 현황')
      .setColor(0x00ae86);

    const days = ['일', '월', '화', '수', '목', '금', '토'];

    for (const [date, guests] of Object.entries(grouped)) {
      const d = new Date(date);
      const dayName = days[d.getDay()] || '';

      // 날짜 제목
      embed.addFields({ name: `🗓️ ${date} (${dayName})`, value: '' });

      for (const g of guests) {
        const emoji = g.rank === 1 ? '🥇' : g.rank === 2 ? '🥈' : '🥉';
        const status =
          g.deposit >= g.total_price
            ? '❤️ 완납'
            : g.deposit === 0
            ? '❌ 없음'
            : g.deposit === 100000000
            ? '💸 1억'
            : `💸 ${g.deposit.toLocaleString()}`;

        // ✅ 예약 입력자 닉네임 조회
        let reserverName = '';
        try {
          const discordId = g.raid_id.split('_')[1];
          const member = await interaction.guild.members.fetch(discordId);
          reserverName =
            member?.nickname || member?.user?.username || 'Unknown';
        } catch {
          reserverName = 'Unknown';
        }

        // 이름/금액/상태 3열 정렬 (라벨 텍스트 없이)
        embed.addFields(
          { name: '', value: `${emoji} ${g.guest_name}`, inline: true },
          {
            name: '',
            value: `💰 ${g.total_price.toLocaleString()}`,
            inline: true,
          },
          { name: '', value: `${status} - (${reserverName})`, inline: true }
        );
      }

      // 날짜별 구분용 빈 줄
      embed.addFields({ name: '', value: '' });
    }

    // ✅ Select 메뉴 구성
    const allGuests = Object.entries(grouped).flatMap(([date, guests]) =>
      guests.map((g) => ({
        label: `${date} | ${g.rank} 순위 - ${g.guest_name}`,
        description: `금액 : ${g.total_price.toLocaleString()}메소 | 예약금 : ${g.deposit.toLocaleString()}`,
        value: g.id, // ex: 2025-10-24_1
      }))
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_edit_guest')
      .setPlaceholder('✏️ 수정할 손님을 선택하세요')
      .addOptions(allGuests.slice(0, 25)); // Discord Select는 최대 25개까지 가능

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: MessageFlags.None,
    });
  } catch (err) {
    console.error('[손님 현황 에러]', err);
    await interaction.reply({
      content: '❌ 손님 정보를 불러오는 중 오류가 발생했습니다.',
      flags: MessageFlags.None,
    });

    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err2) {
        console.error('[에러 메시지 삭제 실패]', err2);
      }
    }, 5000);
  }
};
