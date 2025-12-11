const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const dayjs = require('dayjs');
const { getLogicalToday } = require('../../utils/getLogicalToday');

/**
 * 공통 손님 모달 생성기
 * @param {'add'|'edit'} mode
 * @param {object} data
 * @returns ModalBuilder
 */
function buildGuestModal(mode, data) {
  const {
    modalId,
    title,
    date = '',
    rank = '',
    guestName = '',
    depositLabel = '',
    discount = 0,
  } = data;

  const modal = new ModalBuilder()
    .setCustomId(modalId)
    .setTitle(title);

  const today = dayjs().tz('Asia/Seoul').format('YYYY-MM-DD');
  const logicalToday = getLogicalToday(2 * 60);

  const dateInput = new TextInputBuilder()
    .setCustomId('date')
    .setLabel(`오늘은 (${today}) 입니다. 날짜를 꼭 확인해주세요.`)
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(date || logicalToday);

  const guestNameInput = new TextInputBuilder()
    .setCustomId('guest_name')
    .setLabel('손님 닉네임')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder('ex) 이케아')
    .setValue(guestName ?? '');

  const depositInput = new TextInputBuilder()
    .setCustomId('deposit')
    .setLabel('예약금 상태 (완납 / 1억 / 없음)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder('정확히 (완납/1억/없음) 중에 하나를 입력')
    .setValue(depositLabel || '');

  const discountInput = new TextInputBuilder()
    .setCustomId('discount')
    .setLabel('할인 ex: 10000000 (기본값 0)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setValue(String(discount));

  const rows = [
    new ActionRowBuilder().addComponents(dateInput),
  ];

  if (mode === 'edit') {
    const rankInput = new TextInputBuilder()
      .setCustomId('rank')
      .setLabel('순위 (1~3 중 숫자)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setValue(String(rank));

    rows.push(new ActionRowBuilder().addComponents(rankInput));
  }

  rows.push(
    new ActionRowBuilder().addComponents(guestNameInput),
    new ActionRowBuilder().addComponents(depositInput),
    new ActionRowBuilder().addComponents(discountInput)
  );

  modal.addComponents(...rows);
  return modal;
}

module.exports = { buildGuestModal };
