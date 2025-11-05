const { MessageFlags } = require('discord-api-types/v10');
const {
  updateGuestStatusChannel,
} = require('../../pg/updateGuestStatusChannel');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const prefix = 'modal_delete_guest_';
  const guestId = interaction.customId.startsWith(prefix)
    ? interaction.customId.slice(prefix.length)
    : interaction.customId;

  const serverId = interaction.guildId;
  const confirm = interaction.fields
    .getTextInputValue('confirm_delete')
    ?.trim();

  // 입력 검증
  if (confirm !== '예약취소') {
    await interaction.reply({
      content: '⚠️ "예약취소"라고 정확히 입력해야 삭제됩니다.',
      flags: MessageFlags.Ephemeral,
    });
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);

    return;
  }

  try {
    // DB 삭제
    const res = await pool.query(
      `
      DELETE FROM guest_list
      WHERE server_id = $1 AND id = $2
      RETURNING guest_name, rank, member_id, total_price, deposit, balance, discount, date;
      `,
      [serverId, guestId]
    );

    if (res.rowCount === 0) {
      await interaction.reply({
        content: '❌ 이미 삭제되었거나 존재하지 않는 예약입니다.',
        flags: MessageFlags.Ephemeral,
      });
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch {}
      }, 5000);
      return;
    }

    const g = res.rows[0];
    const date = g.date ?? '날짜 미상';
    const format = (n) => (Number.isFinite(n) ? n.toLocaleString() : '0');

    // 성공 메시지
    await interaction.reply({
      content: [
        `🗑️ **예약 취소 완료!**`,
        '',
        `🗓️ **${date} (${g.rank}순위)**`,
        `👤 **${g.guest_name}**`,
        '',
        `💰 총액: ${format(g.total_price)} 메소`,
        `💸 예약금: ${format(g.deposit)} 메소`,
        `💳 잔금: ${format(g.balance)} 메소`,
        `📉 할인: ${format(g.discount)} 메소`,
      ].join('\n'),
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);

    updateGuestStatusChannel(interaction.client, interaction.guildId, date);
  } catch (err) {
    console.error('[예약 삭제 오류]', err);
    await interaction.reply({
      content: '❌ 예약 삭제 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
    // 5초 후 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
  }
};
