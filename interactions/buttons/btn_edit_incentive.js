const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  // customId: btn_edit_incentive_<id>
  const prefix = 'btn_edit_incentive_';
  const incentiveId = interaction.customId.startsWith(prefix)
    ? interaction.customId.slice(prefix.length)
    : interaction.customId;

  try {
    const { rows } = await pool.query(
      `
      SELECT name, amount 
      FROM incentive_reference 
      WHERE server_id=$1 AND id=$2
      `,
      [serverId, incentiveId]
    );

    if (rows.length === 0) {
      return interaction.reply({
        content: '❌ 해당 인센을 찾을 수 없습니다.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const { name, amount } = rows[0];

    const modal = new ModalBuilder()
      .setCustomId(`modal_edit_incentive_${incentiveId}`)
      .setTitle(`✏️ ${name} 금액 수정`);

    const amountInput = new TextInputBuilder()
      .setCustomId('new_amount')
      .setLabel('새 금액 (메소)')
      .setValue(amount.toLocaleString())
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const row = new ActionRowBuilder().addComponents(amountInput);

    await interaction.showModal(modal.addComponents(row));
  } catch (err) {
    console.error('[인센 수정 모달 오류]', err);
    await interaction.reply({
      content: '❌ 수정 모달을 여는 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
  }
};
