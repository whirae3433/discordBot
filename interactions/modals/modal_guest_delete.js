const { safeReply } = require('../../utils/safeReply');
const { buildGuestMessage } = require('./guest.helpers');
const {
  updateGuestStatusChannel,
} = require('../../pg/updateGuestStatusChannel');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  const prefix = 'modal_guest_delete_';
  const guestId = interaction.customId.startsWith(prefix)
    ? interaction.customId.slice(prefix.length)
    : interaction.customId;

  const confirm = interaction.fields
    .getTextInputValue('confirm_delete')
    ?.trim();

  // 입력 검증
  if (confirm !== '예약취소') {
    return safeReply(
      interaction,
      '⚠️ "예약취소"라고 정확히 입력해야 삭제됩니다.',
      { ephemeral: true, deleteAfter: 3000 }
    );
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
      return safeReply(
        interaction,
        '❌ 이미 삭제되었거나 존재하지 않는 예약입니다.',
        { ephemeral: true, deleteAfter: 3000 }
      );
    }

    const g = res.rows[0];

    const msg = buildGuestMessage('🗑️ **예약 취소 완료!**', g);

    // 성공 메시지 출력 + 자동 삭제
    await safeReply(interaction, msg, {
      ephemeral: true,
      deleteAfter: 3000,
    });

    await updateGuestStatusChannel(interaction.client, serverId, {
      date: g.date,
    });
  } catch (err) {
    console.error('[예약 삭제 오류]', err);

    return safeReply(interaction, '❌ 예약 삭제 중 오류가 발생했습니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
