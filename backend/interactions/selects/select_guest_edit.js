const pool = require('../../pg/db');
const { buildGuestModal } = require('../modals/guestModalBuilder');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;
  const guestId = interaction.values[0];

  await interaction.message.delete().catch(() => {});

  const { rows } = await pool.query(
    `SELECT * FROM guest_list WHERE server_id=$1 AND id=$2`,
    [serverId, guestId]
  );

  if (rows.length === 0)
    return interaction.reply({ content: '❌ 손님 정보를 찾을 수 없습니다.', ephemeral: true });

  const g = rows[0];

  const depositLabel =
    g.deposit === g.total_price ? '완납' :
    g.deposit === 0 ? '없음' :
    g.deposit === 100000000 ? '1억' : '없음';

  const modal = buildGuestModal('edit', {
    modalId: `modal_guest_edit_${guestId}`,
    title: `✏️ ${g.guest_name} 수정`,
    date: g.date,
    rank: g.rank,
    guestName: g.guest_name,
    depositLabel,
    discount: g.discount,
  });

  return interaction.showModal(modal);
};
