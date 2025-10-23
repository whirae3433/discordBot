const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;

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
    .setCustomId('modal_set_amount')
    .setTitle('⚠️ 관리자 외 입력 금지!');

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
};
