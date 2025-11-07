const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;

  try {
    // 모달 입력값 가져오기
    const name = interaction.fields.getTextInputValue('incentive_name')?.trim();
    const rawAmount = interaction.fields
      .getTextInputValue('incentive_amount')
      ?.trim();

    // 유효성 검사
    if (!name || !rawAmount) {
      return interaction.reply({
        content: '⚠️ 모든 칸을 입력해주세요.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const amount = parseInt(rawAmount.replace(/[,]/g, ''), 10);
    if (isNaN(amount) || amount < 0) {
      return interaction.reply({
        content: '❌ 금액은 숫자만 입력할 수 있습니다.',
        flags: MessageFlags.Ephemeral,
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
      await interaction.reply({
        content: `⚠️ 이미 **${name}** 인센이 존재합니다. 다른 이름을 입력해주세요.`,
        flags: MessageFlags.Ephemeral,
      });
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch {}
      }, 5000);

      return;
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
    await interaction.reply({
      content: `✅ **${name}**이(가) ${amount.toLocaleString()} 메소로 저장되었습니다.`,
      flags: MessageFlags.Ephemeral,
    });

    // 5초 뒤 자동 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
  } catch (err) {
    console.error('[인센 추가 저장 오류]', err);
    await interaction.reply({
      content: '❌ 인센 저장 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
  }
};
