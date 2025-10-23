const { EmbedBuilder } = require('discord.js');
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

    const embed = new EmbedBuilder()
      .setTitle('📋 손님 예약 현황')
      .setColor(0x00ae86);

    for (const [date, guests] of Object.entries(grouped)) {
      const lines = guests.map((g) => {
        const emoji = g.rank === 1 ? '🥇' : g.rank === 2 ? '🥈' : '🥉';
        return `${emoji} ${g.guest_name} - ${g.total_price.toLocaleString()} 메소`;
      });
      embed.addFields({ name: `📅 ${date}`, value: lines.join('\n') });
    }

    // ✅ 메시지 전송
    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.None,
    });

    // ✅ 안정적으로 메시지 가져오기
    const message = await interaction.fetchReply();

    // ✅ 10초 후 자동 삭제
    setTimeout(async () => {
      try {
        await message.delete();
      } catch (err) {
        console.error('[메시지 삭제 실패]', err);
      }
    }, 10000);
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
