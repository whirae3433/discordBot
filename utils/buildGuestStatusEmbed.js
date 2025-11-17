/**
 * Embed 생성 전용 함수 (날짜 필터링 X)
 * @param {object} grouped - 날짜별 손님 그룹
 * @param {Guild} guild - Discord guild 객체
 */

const { EmbedBuilder } = require('discord.js');

// 입금 상태 포맷
function formatDepositStatus(guest) {
  if (guest.deposit >= guest.total_price) return '❤️ 완납';
  if (guest.deposit === 0) return '❌ 출발전납';
  if (guest.deposit === 100000000) return '✅ 1억';
  return `💸 ${guest.deposit.toLocaleString()}`;
}

// 빈 날짜 embed 생성

function buildEmptyEmbed(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const d = new Date(date);
  const dayName = days[d.getDay()] || '';

  return new EmbedBuilder()
    .setColor(0xffcc00)
    .setDescription(`🗓️ ${date} (${dayName})\n\n손님 예약 없음`);
}

async function buildGuestStatusEmbed(grouped, guild) {
  if (!grouped || Object.keys(grouped).length === 0) {
    return [buildEmptyEmbed('오늘')];
  }

  const embeds = [];
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  for (const [date, guests] of Object.entries(grouped)) {
    // 날짜 데이터가 비었으면 해당 날짜 빈 embed push
    if (!guests || guests.length === 0) {
      embeds.push(buildEmptyEmbed(date));
      continue;
    }

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
        const member = await guild.members.fetch(g.member_id);
        reserverName =
          member?.nickname ||
          member?.user?.globalName ||
          member?.user?.username ||
          'Unknown';
      } catch {}

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
