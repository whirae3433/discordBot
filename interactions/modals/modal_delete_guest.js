const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const prefix = 'modal_delete_guest_';
  const guestId = interaction.customId.startsWith(prefix)
    ? interaction.customId.slice(prefix.length)
    : interaction.customId;

  const serverId = interaction.guildId;
  const confirm = interaction.fields.getTextInputValue('confirm_delete')?.trim();

  if (confirm !== '예약 취소') {
    return interaction.reply({
      content: '⚠️ "예약 취소"라고 정확히 입력해야 삭제됩니다.',
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    const res = await pool.query(
      `DELETE FROM guest_list WHERE server_id = $1 AND id = $2 RETURNING guest_name, rank, raid_id`,
      [serverId, guestId]
    );

    if (res.rowCount === 0) {
      return interaction.reply({
        content: '❌ 이미 삭제되었거나 존재하지 않는 예약입니다.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const g = res.rows[0];
    const date = g.raid_id.split('_')[0];
    await interaction.reply({
      content: `✅ **${date} (${g.rank}순위)** 손님 **${g.guest_name}** 예약이 취소되었습니다.`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (err) {
    console.error('[예약 삭제 오류]', err);
    await interaction.reply({
      content: '❌ 예약 삭제 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
  }
};
