const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');
const { safeReply, safeDeleteReply } = require('../../utils/safeReply');

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

    await safeReply(
      interaction,
      {
        content: '📋 관리할 인센을 선택하세요.',
        components: [row],
      },
      {
        ephemeral: true,
        deleteAfter: null, // 자동 삭제 없음 (우리가 직접 관리)
      }
    );

    // 🔥 7초 뒤 자동 삭제 타이머
    const deleteTimer = safeDeleteReply(interaction, 7000);

    // 🔥 Collector: 선택하면 타이머 취소
    const collector = interaction.channel.createMessageComponentCollector({
      filter: (i) =>
        i.user.id === interaction.user.id &&
        i.customId === 'select_incentive_manage',
      time: 7000,
    });

    collector.on('collect', () => {
      clearTimeout(deleteTimer); // 선택하면 삭제 타이머 취소
      collector.stop('selected');
      // select 선택 시 update는 다음 파일(select_incentive_manage.js)에서 진행됨
    });
  } catch (err) {
    console.error('[인센 목록 조회 오류]', err.message);

    safeReply(interaction, '❌ 인센 목록을 불러오는 중 오류가 발생했습니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
