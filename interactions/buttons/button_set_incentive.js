const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;

  try {
    const { rows } = await pool.query(
      `SELECT name, amount 
       FROM incentive_reference 
       WHERE server_id = $1
       ORDER BY name ASC`,
      [serverId]
    );

    // select 메뉴
    const select = new StringSelectMenuBuilder()
      .setCustomId('select_incentive_manage')
      .setPlaceholder('인센 목록 보기')
      .addOptions([
        {
          label: '➕ 인센 추가하기',
          description: '새 인센 이름과 금액을 입력합니다.',
          value: 'add_new',
        },
        ...rows.map((row) => ({
          label: `${row.name}`,
          description: `금액: ${row.amount.toLocaleString()} 메소`,
          value: row.name,
        })),
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    // 여기서 바로 reply 
    await interaction.reply({
      content: '📋 관리할 인센을 선택하세요.',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });

    // Collector 생성
    const collector = interaction.channel.createMessageComponentCollector({
      filter: (i) =>
        i.user.id === interaction.user.id &&
        i.customId === 'select_incentive_manage',
      time: 10_000,
    });

    collector.on('collect', async (i) => {
      try {
        await interaction.deleteReply().catch(() => {});
        collector.stop('selected');
      } catch (err) {
        console.error('[선택 후 삭제 실패]', err);
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason !== 'selected') {
        try {
          await interaction.deleteReply().catch(() => {});
        } catch (err) {
          console.error('[자동삭제 실패]', err.message);
        }
      }
    });
  } catch (err) {
    console.error('[인센 목록 조회 오류]', err);
    try {
      await interaction.reply({
        content: '❌ 인센 목록을 불러오는 중 오류가 발생했습니다.',
        flags: MessageFlags.Ephemeral,
      });
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch {}
      }, 5000);
    } catch {}
  }
};
