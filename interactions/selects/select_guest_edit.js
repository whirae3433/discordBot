const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;
  const guestId = interaction.values[0];

  try {
    // 이전 메시지(Embed + SelectMenu) 삭제
    await interaction.message.delete().catch(() => {});

    // 해당 손님 정보 불러오기
    const res = await pool.query(
      `
      SELECT member_id, guest_name, total_price, deposit, balance, rank, discount, date
      FROM guest_list
      WHERE server_id = $1 AND id = $2
      `,
      [serverId, guestId]
    );

    if (res.rowCount === 0) {
      return interaction.reply({
        content: '❌ 해당 손님 예약 정보를 찾을 수 없습니다.',
        ephemeral: true,
      });
    }

    const g = res.rows[0];
    const currentDate = g.date;

    // 모달 생성
    const modal = new ModalBuilder()
      .setCustomId(`modal_guest_edit_${guestId}`)
      .setTitle(`✏️ ${g.guest_name} 수정`);

    // 날짜
    const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD');
    const dateInput = new TextInputBuilder()
      .setCustomId('date')
      .setLabel(`오늘은 (${today}) 입니다.`)
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(currentDate);

    // 순위 (1~3 입력)
    const rankInput = new TextInputBuilder()
      .setCustomId('rank')
      .setLabel('순위 (숫자만 입력. 1~3 중 하나)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(String(g.rank ?? 1));

    const guestNameInput = new TextInputBuilder()
      .setCustomId('guest_name')
      .setLabel('손님 이름')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(g.guest_name ?? '');

    const depositInput = new TextInputBuilder()
      .setCustomId('deposit')
      .setLabel('정확히 (완납 / 1억 / 없음) 중 하나를 입력')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(
        g.deposit === g.total_price
          ? '완납'
          : g.deposit === 0
          ? '없음'
          : g.deposit === 100000000
          ? '1억'
          : '없음'
      );

    // 할인 금액
    const discountInput = new TextInputBuilder()
      .setCustomId('discount')
      .setLabel('할인 ex: 10000000 (기본값 0)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(String(g.discount ?? 0));

    modal.addComponents(
      new ActionRowBuilder().addComponents(dateInput),
      new ActionRowBuilder().addComponents(rankInput),
      new ActionRowBuilder().addComponents(guestNameInput),
      new ActionRowBuilder().addComponents(depositInput),
      new ActionRowBuilder().addComponents(discountInput)
    );

    // ✅ 모달 띄우기
    await interaction.showModal(modal);
  } catch (err) {
    console.error('[select_guest_edit 모달 에러]', err);
    if (!interaction.replied) {
      await interaction.reply({
        content: '❌ 수정 모달을 여는 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  }
};
