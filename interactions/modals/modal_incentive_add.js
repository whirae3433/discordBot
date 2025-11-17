const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');
const { safeReply } = require('../../utils/safeReply');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;

  // 디스코드 응답 타임아웃 방지
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const name = interaction.fields.getTextInputValue('incentive_name')?.trim();
    const rawAmount = interaction.fields
      .getTextInputValue('incentive_amount')
      ?.trim();

    // 유효성 검사
    if (!name || !rawAmount) {
      return safeReply(interaction, '⚠️ 모든 칸을 입력해주세요.', {
        deleteAfter: 3000,
      });
    }

    const amount = parseInt(rawAmount.replace(/[,]/g, ''), 10);
    if (isNaN(amount) || amount < 0) {
      return safeReply(interaction, '❌ 금액은 숫자만 입력할 수 있습니다.', {
        deleteAfter: 3000,
      });
    }

    // 중복 검사
    const check = await pool.query(
      `SELECT 1 
      FROM incentive_reference 
      WHERE server_id = $1 AND name = $2`,
      [serverId, name]
    );

    if (check.rowCount > 0) {
      return safeReply(
        interaction,
        `⚠️ 이미 **${name}** 인센이 존재합니다. 다른 이름을 입력해주세요.`,
        { deleteAfter: 3000 }
      );
    }

    // DB 저장 (있으면 업데이트)
    await pool.query(
      `
      INSERT INTO incentive_reference (server_id, name, amount)
      VALUES ($1, $2, $3)
      `,
      [serverId, name, amount]
    );

    // 성공 메시지
    return safeReply(
      interaction,
      `✅ **${name}**이(가) ${amount.toLocaleString()} 메소로 저장되었습니다.`,
      { deleteAfter: 3000 }
    );
  } catch (err) {
    console.error('[인센 추가 저장 오류]', err);

    return safeReply(interaction, '❌ 인센 저장 중 오류가 발생했습니다.', {
      deleteAfter: 3000,
    });
  }
};
