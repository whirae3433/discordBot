const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { getGuestListByDate } = require('../pg/selectGuestList');

/** 입금 상태 포맷 */
function formatDepositStatus(guest) {
  if (guest.deposit >= guest.total_price) return '❤️ 완납';
  if (guest.deposit === 0) return '❌ 없음';
  if (guest.deposit === 100000000) return '💸 1억';
  return `💸 ${guest.deposit.toLocaleString()}`;
}

/** 손님 현황 Embed + SelectMenus 생성 */
async function buildGuestStatusEmbed(interaction, serverId) {
  const grouped = await getGuestListByDate(serverId);

  if (!grouped || Object.keys(grouped).length === 0) return null;

  const embed = new EmbedBuilder()
    .setTitle('📋 손님 예약 현황')
    .setColor(0x00ae86);

  const days = ['일', '월', '화', '수', '목', '금', '토'];

  for (const [date, guests] of Object.entries(grouped)) {
    const d = new Date(date);
    const dayName = days[d.getDay()] || '';
    embed.addFields({ name: `🗓️ ${date} (${dayName})`, value: '' });

    for (const g of guests) {
      const emoji = g.rank === 1 ? '🥇' : g.rank === 2 ? '🥈' : '🥉';
      const status = formatDepositStatus(g);

      // 예약 입력자 닉네임 조회
      let reserverName = '';
      try {
        const discordId = g.raid_id.split('_')[1];
        const member = await interaction.guild.members.fetch(discordId);
        reserverName = member?.nickname || member?.user?.username || 'Unknown';
      } catch {
        reserverName = 'Unknown';
      }

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

    embed.addFields({ name: '\u200B', value: '' });
  }
  return embed;
}
module.exports = { buildGuestStatusEmbed };
