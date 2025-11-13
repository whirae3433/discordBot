const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');
const { getGuestListByDate } = require('../../pg/selectGuestList');
const { buildGuestStatusEmbed } = require('../../utils/buildGuestStatusEmbed');
const { deleteAfter } = require('../../utils/deleteAfter');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  try {
    const grouped = await getGuestListByDate(serverId, 'from_today');
    const embeds = await buildGuestStatusEmbed(grouped, interaction.guild);

    // 순위별 금액 조회
    const res = await pool.query(
      `
      SELECT rank, amount 
      FROM amount_by_rank 
      WHERE server_id = $1 
      ORDER BY rank
      `,
      [serverId]
    );

    const amountMap = { 1: 0, 2: 0, 3: 0 };
    res.rows.forEach((row) => {
      amountMap[row.rank] = row.amount;
    });

    // 안전한 금액 포맷
    const format = (n) => (Number.isFinite(n) ? n.toLocaleString() : '0');

    // Select 메뉴
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_guest_reserve')
      .setPlaceholder('✏️ 예약할 순위를 선택하세요')
      .addOptions([
        {
          label: `🥇 1순위 - ${format(amountMap[1])} 메소`,
          value: 'rank1',
        },
        {
          label: `🥈 2순위 - ${format(amountMap[2])} 메소`,
          value: 'rank2',
        },
        {
          label: `🥉 3순위 - ${format(amountMap[3])} 메소`,
          value: 'rank3',
        },
      ]);

    const components = [new ActionRowBuilder().addComponents(selectMenu)];

    // 이 버튼 누른 사람만 보이게 ephemeral 응답
    const reply = await interaction.reply({
      embeds,
      components,
      flags: MessageFlags.Ephemeral,
    });

    // 7초 후 자동 삭제 (아무 선택도 안 하면)
    deleteAfter(interaction, 7000);
  } catch (err) {
    console.error('[guest_reserve 버튼 오류]', err);

    await interaction.reply({
      content: '❌ 예약 정보를 불러오는 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
    deleteAfter(interaction, 3000);
  }
};
