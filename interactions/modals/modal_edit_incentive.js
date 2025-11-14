const { safeReply } = require('../../utils/safeReply');
const { parseIntSafe } = require('../../utils/parseIntSafe');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;

  const prefix = 'modal_edit_incentive_';
  const incentiveId = interaction.customId.replace(prefix, '');

  try {
    const raw = interaction.fields.getTextInputValue('new_amount')?.trim();
    const amount = parseIntSafe(raw, -1);

    if (amount < 0) {
      return safeReply(
        interaction,
        '⚠️ 금액은 0 이상의 숫자만 입력할 수 있어요.',
        {
          deleteAfter: 3000,
        }
      );
    }

    const updateRes = await pool.query(
      `
      UPDATE incentive_reference
         SET amount = $3
       WHERE server_id = $1 AND id = $2
      RETURNING name;
      `,
      [serverId, incentiveId, amount]
    );

    if (updateRes.rowCount === 0) {
      return safeReply(interaction, '❌ 해당 인센을 찾을 수 없습니다.', {
        deleteAfter: 3000,
      });
    }

    const incentiveName = updateRes.rows[0].name;

    return safeReply(
      interaction,
      `✅ **${incentiveName}** 금액이 ${amount.toLocaleString()} 메소로 수정되었습니다.`,
      { deleteAfter: 3000 }
    );
  } catch (err) {
    console.error('[인센 수정 저장 오류]', err);
    return safeReply(interaction, '❌ 수정 저장 중 오류가 발생했습니다.', {
      deleteAfter: 3000,
    });
  }
};
