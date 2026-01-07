const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { safeReply } = require('../../utils/safeReply');

module.exports = async (interaction) => {
  try {
    const select = new StringSelectMenuBuilder()
      .setCustomId('profile_select_job')
      .setPlaceholder('조회할 직업을 선택하세요')
      .addOptions([
        { label: '영웅 - (아란, 에반, 듀블)', value: 'heroes' },
        { label: '전사 - (히어로, 닼나, 팔라딘)', value: 'warrior' },
        { label: '법사 - (비숍, 썬콜, 불독)', value: 'mage' },
        { label: '궁수 - (보마, 신궁)', value: 'archer' },
        { label: '도적 - (나로, 섀도어)', value: 'thief' },
        { label: '해적 - (캡틴, 바이퍼)', value: 'pirate' },
        { label: '버프 - (리저, 리프, 뻥)', value: 'buff' },
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    return safeReply(
      interaction,
      {
        content: '🗂️ 직업별로 길드원을 조회할 수 있습니다.',
        components: [row],
      },
      {
        ephemeral: true,
        deleteAfter: 15000,
      }
    );
  } catch (err) {
    console.error('[직업별 검색 버튼 오류]', err);
    return safeReply(interaction, '❌ 직업 선택 메뉴 생성에 실패했습니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
