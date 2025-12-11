const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const pool = require('../../pg/db');
const { getGuestListByDate } = require('../../pg/selectGuestList');
const { buildGuestStatusEmbed } = require('../../utils/buildGuestStatusEmbed');
const { safeReply } = require('../../utils/safeReply');

// ---------------- Helper functions ---------------- //
function buildAmountMap(rows) {
  const amountMap = { 1: 0, 2: 0, 3: 0 };
  rows.forEach((r) => (amountMap[r.rank] = r.amount));
  return amountMap;
}

function buildSelectMenu(amountMap) {
  const fmt = (n) => (Number.isFinite(n) ? n.toLocaleString() : '0');

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select_guest_reserve')
      .setPlaceholder('✏️ 예약할 순위를 선택하세요')
      .addOptions([
        { label: `🥇 1순위 - ${fmt(amountMap[1])} 메소`, value: 'rank1' },
        { label: `🥈 2순위 - ${fmt(amountMap[2])} 메소`, value: 'rank2' },
        { label: `🥉 3순위 - ${fmt(amountMap[3])} 메소`, value: 'rank3' },
      ])
  );
}

// ---------------- Main Handler ---------------- //
module.exports = async (interaction) => {
  const serverId = interaction.guildId;
  const guild = interaction.guild;

  try {
    // 1) "손님 데이터 + 순위별 금액" 동시에 조회
    const [grouped, amountRes] = await Promise.all([
      getGuestListByDate(serverId, 'from_today'),
      pool.query(
        `
        SELECT rank, amount 
        FROM amount_by_rank 
        WHERE server_id = $1 
        ORDER BY rank
        `,
        [serverId]
      ),
    ]);

    // 2) Embed 및 메뉴 구성
    const embeds = await buildGuestStatusEmbed(grouped, guild);
    const amountMap = buildAmountMap(amountRes.rows);
    const menu = buildSelectMenu(amountMap);

    return safeReply(
      interaction,
      {
        embeds,
        components: [menu],
      },
      {
        ephemeral: true,
        deleteAfter: 7000,
      }
    );
  } catch (err) {
    console.error('[guest_reserve 버튼 오류]', err);

    return safeReply(
      interaction,
      '❌ 예약 정보를 불러오는 중 오류가 발생했습니다.',
      {
        ephemeral: true,
        deleteAfter: 3000,
      }
    );
  }
};
