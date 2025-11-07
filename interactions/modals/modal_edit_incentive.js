const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;

  // customId: modal_edit_incentive_<id>
  const prefix = 'modal_edit_incentive_';
  const incentiveId = interaction.customId.startsWith(prefix)
    ? interaction.customId.slice(prefix.length)
    : interaction.customId;

  try {
    const raw = interaction.fields.getTextInputValue('new_amount')?.trim();
    const amount = parseInt(String(raw).replace(/[,]/g, ''), 10);

    if (!Number.isFinite(amount) || amount < 0) {
      return interaction.reply({
        content: '⚠️ 금액은 0 이상의 숫자만 입력할 수 있어요.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const res = await pool.query(
      `
      UPDATE incentive_reference
         SET amount = $3
       WHERE server_id = $1 AND id = $2
       RETURNING name;
      `,
      [serverId, incentiveId, amount]
    );

    const incentiveName = res.rows[0].name;

    await interaction.reply({
      content: `✅ **${incentiveName}** 금액이 ${amount.toLocaleString()} 메소로 수정되었습니다.`,
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
  } catch (err) {
    console.error('[인센 수정 저장 오류]', err);
    await interaction.reply({
      content: '❌ 수정 저장 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
  }
};
