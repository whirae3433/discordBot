const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const pool = require('../../pg/db');
const { safeReply } = require('../../utils/safeReply');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const userId = interaction.user.id;

  try {
    //  관리자 권한 확인
    const adminRes = await pool.query(
      `
      SELECT 1 FROM bot_admins 
      WHERE server_id = $1 AND discord_id = $2
      `,
      [serverId, userId]
    );

    if (adminRes.rowCount === 0) {
      return safeReply(interaction, '⚠️ 관리자 전용 버튼입니다.', {
        ephemeral: true,
        deleteAfter: 3000,
      });
    }

    // 1. 현재 서버의 순위별 금액 가져오기
    const amountRes = await pool.query(
      `
      SELECT rank, amount 
      FROM amount_by_rank 
      WHERE server_id = $1
      ORDER BY rank ASC
      `,
      [serverId]
    );

    // 2. rank:amount 구조로 매핑
    const amountMap = { 1: null, 2: null, 3: null };
    amountRes.rows.forEach((row) => {
      amountMap[row.rank] = row.amount.toLocaleString();
    });

    const modal = new ModalBuilder()
      .setCustomId('modal_set_amount')
      .setTitle('💰 금액을 설정해 주세요');

    const INPUT_LABELS = ['1순위 금액', '2순위 금액', '3순위 금액'];

    const rows = [1, 2, 3].map((rank) => {
      const formatted = amountMap[rank]?.toLocaleString() ?? '260000000';

      return new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(`amount_rank${rank}`)
          .setLabel(INPUT_LABELS[rank - 1])
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(`예: ${formatted}`)
          .setRequired(true)
      );
    });

    modal.addComponents(...rows);

    return interaction.showModal(modal);
  } catch (err) {
    console.error('[modal_set_amount 오류]', err);

    return safeReply(interaction, '⚠️ 모달 표시 중 오류가 발생했습니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
