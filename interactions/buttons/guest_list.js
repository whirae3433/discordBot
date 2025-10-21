const { EmbedBuilder } = require('discord.js');
const { getGuestListByDate } = require('../../pg/selectGuestList');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  try {
    const grouped = await getGuestListByDate(serverId);

    if (Object.keys(grouped).length === 0) {
      return interaction.reply({
        content: '❌ 등록된 손님이 없습니다.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 손님 예약 현황')
      .setColor(0x00ae86);

    for (const [date, guests] of Object.entries(grouped)) {
      const lines = guests.map((g) => {
        const emoji = g.rank === 1 ? '🥇' : g.rank === 2 ? '🥈' : '🥉';
        return `${emoji} ${
          g.guest_name
        } - ${g.total_price.toLocaleString()} 메소`;
      });
      embed.addFields({ name: `📅 ${date}`, value: lines.join('\n') });
    }

    await interaction.reply({ embeds: [embed], ephemeral: false });
    // 🔽 전송한 메시지 객체 가져오기
    const sentMessage = await interaction.fetchReply();

    // 🔽 3초 후 삭제
    setTimeout(async () => {
      try {
        await sentMessage.delete();
      } catch (err) {
        console.error('[메시지 삭제 실패]', err);
      }
    }, 10000);
  } catch (err) {
    console.error('[손님 현황 에러]', err);
    await interaction.reply({
      content: '❌ 손님 정보를 불러오는 중 오류가 발생했습니다.',
      ephemeral: false,
    });
  }
};
