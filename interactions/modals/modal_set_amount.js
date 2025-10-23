const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  try {
    // 입력값 처리
    const amounts = [1, 2, 3].map((rank) => {
      const raw = interaction.fields.getTextInputValue(`amount_rank${rank}`);
      const amount = parseInt(raw.replace(/,/g, ''), 10);
      if (isNaN(amount)) throw new Error(`${rank}순위 금액이 숫자가 아닙니다.`);
      return { rank, amount };
    });

    // DB 저장
    for (const { rank, amount } of amounts) {
      await pool.query(
        `INSERT INTO amount_by_rank (server_id, rank, amount)
         VALUES ($1, $2, $3)
         ON CONFLICT (server_id, rank)
         DO UPDATE SET amount = EXCLUDED.amount`,
        [serverId, rank, amount]
      );
    }

    // ✅ 순위별 금액 표시용 텍스트
    const summary = amounts
      .map(({ rank, amount }) => {
        const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
        return `${emoji} ${rank}순위: ${amount.toLocaleString()} 메소`;
      })
      .join('\n');

    // ✅ 성공 메시지 출력
    await interaction.reply({
      content: `✅ 금액이 성공적으로 저장되었습니다!\n\n${summary}`,
      flags: MessageFlags.Ephemeral,
    });

    // 5초 뒤 자동 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err) {
        console.error('[메시지 삭제 오류]', err);
      }
    }, 5000);
  } catch (err) {
    console.error('[금액 저장 오류]', err);

    await interaction.reply({
      content: '❌ 금액 저장 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });

    // 오류 메시지도 5초 뒤 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err2) {
        console.error('[에러 메시지 삭제 오류]', err2);
      }
    }, 5000);
  }
};
