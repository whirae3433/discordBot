const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const guestId = interaction.values[0];
  const serverId = interaction.guildId;

  try {
    // 이전 메시지(Embed + SelectMenu) 삭제
    await interaction.message.delete().catch(() => {});

    // 손님 정보 조회
    const res = await pool.query(
      `
      SELECT guest_name, rank, date
      FROM guest_list
      WHERE id = $1 AND server_id = $2
      `,
      [guestId, serverId]
    );

    const g = res.rows[0];
    const date = g.date ?? '날짜 미상';

    // 모달 생성
    const modal = new ModalBuilder()
      .setCustomId(`modal_delete_guest_${guestId}`)
      .setTitle('⚠️ 예약 취소 확인');

    const confirmInput = new TextInputBuilder()
      .setCustomId('confirm_delete')
      .setLabel(`${g.guest_name}의 예약을 취소하려면 '예약취소'를 입력하세요.`)
      .setPlaceholder('예약취소')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(confirmInput));

    // 모달 표시
    await interaction.showModal(modal);
  } catch (err) {
    console.error('[select_delete_guest 에러]', err);
    if (!interaction.replied) {
      await interaction.reply({
        content: '❌ 예약 취소 모달을 여는 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  }
};
