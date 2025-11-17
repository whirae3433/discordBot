const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const pool = require('../../pg/db');
const { safeReply } = require('../../utils/safeReply');

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
    const selectMenu = new StringSelectMenuBuilder()
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

    const componentRow = new ActionRowBuilder().addComponents(selectMenu);

    return safeReply(
      interaction,
      {
        content: '📋 관리할 인센을 선택하세요.',
        components: [componentRow],
      },
      {
        ephemeral: true,
        deleteAfter: 7000, // 자동 삭제 없음 (우리가 직접 관리)
      }
    );
  } catch (err) {
    console.error('[인센 목록 조회 오류]', err.message);

    safeReply(interaction, '❌ 인센 목록을 불러오는 중 오류가 발생했습니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
