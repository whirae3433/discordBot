const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');
const { deleteAfter } = require('../../utils/deleteAfter');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const userId = interaction.user.id;

  try {
    //  관리자 권한 확인
    const adminCheck = await pool.query(
      `SELECT 1 FROM bot_admins 
       WHERE server_id = $1 AND discord_id = $2`,
      [serverId, userId]
    );

    if (adminCheck.rowCount === 0) {
      await interaction.reply({
        content: '⚠️ 관리자 전용 버튼입니다.',
        flags: MessageFlags.Ephemeral,
      });
      // 5초 뒤 메시지 삭제
      return deleteAfter(interaction, 7000);
    }

    // 1. 현재 서버의 순위별 금액 가져오기
    const res = await pool.query(
      `SELECT rank, amount FROM amount_by_rank WHERE server_id = $1`,
      [serverId]
    );

    // 2. rank:amount 구조로 매핑
    const amountMap = {};
    res.rows.forEach((row) => {
      amountMap[row.rank] = row.amount.toLocaleString(); // 쉼표 표시
    });

    const modal = new ModalBuilder()
      .setCustomId('modal_set_amount')
      .setTitle('💰 금액을 설정해 주세요');

    const inputs = ['1순위', '2순위', '3순위'].map((label, idx) => {
      const rank = idx + 1;
      const placeholder = amountMap[rank]
        ? `예: ${amountMap[rank]}`
        : `예: 260000000`;

      return new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(`amount_rank${idx + 1}`) // amount_rank1~3
          .setLabel(`${label} 금액`)
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(placeholder)
          .setRequired(true)
      );
    });

    modal.addComponents(...inputs);
    await interaction.showModal(modal);
  } catch (err) {
    console.error('[modal_set_amount 오류]', err);
    await interaction.reply({
      content: '⚠️ 모달 표시 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });

    return deleteAfter(interaction, 7000);
  }
};
