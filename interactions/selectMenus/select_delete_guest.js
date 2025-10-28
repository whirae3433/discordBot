const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const guestId = interaction.values[0]; // ex: 2025-10-28_1

  const res = await pool.query(
    `SELECT guest_name FROM guest_list WHERE id = $1 AND server_id = $2`,
    [guestId, interaction.guildId]
  );

  if (res.rowCount === 0) {
    return interaction.reply({
      content: '❌ 해당 예약을 찾을 수 없습니다.',
      ephemeral: true,
    });
  }

  const g = res.rows[0];

  const modal = new ModalBuilder()
    .setCustomId(`modal_delete_guest_${guestId}`)
    .setTitle('⚠️ 예약 취소 확인');

  const confirmInput = new TextInputBuilder()
    .setCustomId('confirm_delete')
    .setLabel(
      `${g.guest_name}의 예약을 취소하려면 '예약 취소'를 입력하세요.`
    )
    .setPlaceholder('예약 취소')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(confirmInput));

  await interaction.showModal(modal);
};
