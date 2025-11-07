const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;

  // customId: btn_delete_incentive_confirm_<id>
  const prefix = 'btn_delete_incentive_confirm_';
  const isCancel = !interaction.customId.startsWith(prefix);

  if (isCancel) {
    // 취소 버튼 처리
    await interaction.reply({
      content: '삭제를 취소했습니다.',
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);

    return;
  }

  const incentiveId = interaction.customId.slice(prefix.length);

  try {
    const res = await pool.query(
      `
      DELETE FROM incentive_reference
      WHERE server_id=$1 AND id=$2
      `,
      [serverId, incentiveId]
    );

    if (res.rowCount === 0) {
      await interaction.reply({
        content: '❌ 이미 삭제되었거나 존재하지 않는 인센입니다.',
        flags: MessageFlags.Ephemeral,
      });
    } else
      interaction.reply({
        content: `🗑️ 삭제가 완료되었습니다.`,
        flags: MessageFlags.Ephemeral,
      });

    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
  } catch (err) {
    console.error('[인센 삭제 오류]', err);
    await interaction.reply({
      content: '❌ 삭제 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });

    // 오류 메시지도 자동 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
  }
};
