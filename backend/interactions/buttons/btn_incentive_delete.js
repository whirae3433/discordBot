const { safeReply } = require('../../utils/safeReply');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const prefix = 'btn_incentive_delete_';
  const incentiveId = interaction.customId.replace(prefix, '');
  const serverId = interaction.guild.id;

  try {
    // DB 삭제
    const res = await pool.query(
      `
      DELETE FROM incentive_reference
      WHERE server_id = $1 AND id = $2
      `,
      [serverId, incentiveId]
    );

    if (res.rowCount === 0) {
      return safeReply(
        interaction,
        '❌ 이미 삭제되었거나 존재하지 않는 인센입니다.',
        {
          ephemeral: true,
          deleteAfter: 3000,
        }
      );
    }

    // 성공 메시지
    return safeReply(interaction, '🗑️ 삭제가 완료되었습니다!', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  } catch (err) {
    console.error('[인센 삭제 오류]', err);

    return safeReply(interaction, '❌ 삭제 중 오류가 발생했습니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
