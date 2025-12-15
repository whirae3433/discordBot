// selects/select_incentive_manage.js
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { safeDeleteReply } = require('../../utils/safeReply');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const selected = interaction.values[0];

  try {
    if (selected === 'add_new') {
      // 모달 띄우기
      const modal = new ModalBuilder()
        .setCustomId('modal_incentive_add')
        .setTitle('➕ 새 인센 추가');

      const nameInput = new TextInputBuilder()
        .setCustomId('incentive_name')
        .setLabel('인센 이름')
        .setPlaceholder('예: 구인비, 원대컨, 메용30, 혹받이 등')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      const amountInput = new TextInputBuilder()
        .setCustomId('incentive_amount')
        .setLabel('금액 (메소)')
        .setPlaceholder('예: 5000000000')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

      return interaction.showModal(
        modal.addComponents(
          new ActionRowBuilder().addComponents(nameInput),
          new ActionRowBuilder().addComponents(amountInput)
        )
      );
    }

    const { rows } = await pool.query(
      `
      SELECT id, name, amount
      FROM incentive_reference
      WHERE server_id = $1 AND name = $2
      `,
      [serverId, selected]
    );

    if (rows.length === 0) {
      return interaction.update({
        content: '❌ 해당 인센이 존재하지 않습니다.',
        components: [],
      });
    }

    const incentive = rows[0];

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn_incentive_edit_${incentive.id}`)
        .setLabel('✏️ 수정하기')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`btn_incentive_delete_${incentive.id}`)
        .setLabel('🗑️ 삭제하기')
        .setStyle(ButtonStyle.Danger)
    );

    return interaction
      .update({
        content: `📃 **${
          incentive.name
        }**\n💰 ${incentive.amount.toLocaleString()} 메소`,
        components: [buttons],
      })
      .then(() => safeDeleteReply(interaction, 3000));
  } catch (err) {
    console.error('[인센 선택 처리 오류]', err);

    try {
      await interaction.update({
        content: '❌ 인센 선택 처리 중 오류가 발생했습니다.',
        components: [],
      });
    } catch {}
  }
};
