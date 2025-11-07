const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const selected = interaction.values[0]; // 사용자가 선택한 인센 이름 or 'add_new'

  try {
    // 인센 추가하기 선택 시 → 모달 열기
    if (selected === 'add_new') {
      const modal = new ModalBuilder()
        .setCustomId('modal_add_incentive')
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

      const row1 = new ActionRowBuilder().addComponents(nameInput);
      const row2 = new ActionRowBuilder().addComponents(amountInput);

      await interaction.showModal(modal.addComponents(row1, row2));
      return;
    }

    // 기존 인센 선택 시 → 수정 / 삭제 버튼 표시
    const { rows } = await pool.query(
      `
      SELECT id, name, amount 
      FROM incentive_reference 
      WHERE server_id = $1 AND name = $2
      `,
      [serverId, selected]
    );

    if (rows.length === 0) {
      return interaction.reply({
        content: '❌ 해당 인센이 존재하지 않습니다.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const incentive = rows[0];

    // 버튼 2개: 수정 / 삭제
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn_edit_incentive_${incentive.id}`)
        .setLabel('✏️ 수정하기')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`btn_delete_incentive_${incentive.id}`)
        .setLabel('🗑️ 삭제하기')
        .setStyle(ButtonStyle.Danger)
    );

    // 메시지 전송
    await interaction.reply({
      content: `항목 : ${
        incentive.name
      }\n금액 : ${incentive.amount.toLocaleString()} 메소`,
      components: [buttons],
      flags: MessageFlags.Ephemeral,
    });

    // collector 생성 (버튼 클릭 or 7초 후 자동 삭제)
    const collector = interaction.channel.createMessageComponentCollector({
      filter: (i) =>
        i.user.id === interaction.user.id &&
        (i.customId === `btn_edit_incentive_${incentive.id}` ||
          i.customId === `btn_delete_incentive_${incentive.id}`),
      time: 7000,
    });

    collector.on('collect', async (i) => {
      try {
        await interaction.deleteReply().catch(() => {});
        collector.stop('clicked');
      } catch (err) {
        console.error('[버튼 클릭 후 삭제 실패]', err);
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason !== 'clicked') {
        try {
          await interaction.deleteReply().catch(() => {});
        } catch (err) {
          console.error('[자동삭제 실패]', err.message);
        }
      }
    });
  } catch (err) {
    console.error('[인센 선택 처리 오류]', err);
    try {
      await interaction.followUp({
        content: '❌ 인센 선택 처리 중 오류가 발생했습니다.',
        flags: MessageFlags.Ephemeral,
      });
    } catch {}
  }
};
