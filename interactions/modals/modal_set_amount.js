const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  const amounts = [1, 2, 3].map((rank) => {
    const raw = interaction.fields.getTextInputValue(`amount_rank${rank}`);
    const amount = parseInt(raw.replace(/,/g, ''), 10);
    if (isNaN(amount)) throw new Error(`${rank}순위 금액이 숫자가 아닙니다.`);
    return { rank, amount };
  });

  try {
    for (const { rank, amount } of amounts) {
      await pool.query(
        `INSERT INTO amount_by_rank (server_id, rank, amount)
         VALUES ($1, $2, $3)
         ON CONFLICT (server_id, rank) DO UPDATE SET amount = EXCLUDED.amount`,
        [serverId, rank, amount]
      );
    }

    await interaction.reply({
      content: '✅ 금액이 성공적으로 저장되었습니다!',
      flags: MessageFlags.Ephemeral,
    });
  } catch (err) {
    console.error('[금액 저장 오류]', err);
    await interaction.reply({
      content: '❌ 금액 저장 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
  }
};
