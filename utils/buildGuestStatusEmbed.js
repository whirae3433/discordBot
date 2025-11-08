const { EmbedBuilder } = require('discord.js');
const { getGuestListByDate } = require('../pg/selectGuestList');

/** 입금 상태 포맷 */
function formatDepositStatus(guest) {
  if (guest.deposit >= guest.total_price) return '❤️ 완납';
  if (guest.deposit === 0) return '❌ 출발전납';
  if (guest.deposit === 100000000) return '✅ 1억';
  return `💸 ${guest.deposit.toLocaleString()}`;
}

/** 손님 현황 Embed + SelectMenus 생성 */
async function buildGuestStatusEmbed(interaction, serverId) {
  const grouped = await getGuestListByDate(serverId);
  if (!grouped || Object.keys(grouped).length === 0) {
    const emptyEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ 손님 데이터 없음')
      .setDescription('등록된 손님이 없습니다.');
    return [emptyEmbed];
  }

  const embeds = [];
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  for (const [date, guests] of Object.entries(grouped)) {
    const d = new Date(date);
    const dayName = days[d.getDay()] || '';

    // 날짜별로 새로운 Embed 생성
    const embed = new EmbedBuilder()
      .setColor(0x00ae86)
      .setDescription(`🗓️ ${date} (${dayName})`);

    for (const g of guests) {
      const emoji = g.rank === 1 ? '🥇' : g.rank === 2 ? '🥈' : '🥉';
      const status = formatDepositStatus(g);

      let reserverName = '';
      try {
        const discordId = g.member_id;
        const member = await interaction.guild.members.fetch(discordId);
        reserverName =
          member?.nickname ||
          member?.user?.globalName ||
          member?.user?.username ||
          'Unknown';
      } catch {
        reserverName = 'Unknown';
      }

      embed.addFields(
        { name: '', value: `${emoji} ${g.guest_name}`, inline: true },
        {
          name: '',
          value: `💰 ${g.total_price.toLocaleString()} 메소`,
          inline: true,
        },
        { name: '', value: `${status} (${reserverName})`, inline: true }
      );
    }

    embeds.push(embed);
  }

  return embeds;
}

module.exports = { buildGuestStatusEmbed };
