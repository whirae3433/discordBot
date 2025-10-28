const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  try {
    const res = await pool.query(
      `SELECT rank, amount FROM amount_by_rank WHERE server_id = $1 ORDER BY rank`,
      [serverId]
    );

    const amountMap = { 1: 0, 2: 0, 3: 0 };
    res.rows.forEach((row) => {
      amountMap[row.rank] = row.amount;
    });

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_guest_reserve')
        .setPlaceholder('예약할 순위를 선택하세요')
        .addOptions([
          {
            label: `🥇 1순위 - ${amountMap[1].toLocaleString()} 메소`,
            value: 'rank1',
          },
          {
            label: `🥈 2순위 - ${amountMap[2].toLocaleString()} 메소`,
            value: 'rank2',
          },
          {
            label: `🥉 3순위 - ${amountMap[3].toLocaleString()} 메소`,
            value: 'rank3',
          },
        ])
    );

    await interaction.reply({
      content: '📝 예약할 순위를 선택해주세요.',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
  } catch (err) {
    console.error('[guest_reserve 버튼 오류]', err);
    await interaction.reply({
      content: '❌ 금액 정보를 불러오는 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
  }
};
