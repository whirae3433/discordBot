const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const { safeReply } = require('../../utils/safeReply');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const userId = interaction.user.id;

  try {
    // 등록/수정 버튼
    const registerBtn = new ButtonBuilder()
      .setLabel('등록/수정')
      .setStyle(ButtonStyle.Link)
      .setURL(`${process.env.FRONTEND_BASE_URL}/${serverId}/profile/${userId}`);

    // 닉네임 검색 버튼
    const searchBtn = new ButtonBuilder()
      .setCustomId('btn_profile_search')
      .setLabel('길드원 검색 🔎')
      .setStyle(ButtonStyle.Success);

    // 직업별 조회 SelectMenu (직업 목록은 나중에 실제 DB 사용)
    const jobSelect = new StringSelectMenuBuilder()
      .setCustomId('profile_select_job')
      .setPlaceholder('직업별 조회')
      .addOptions([
        { label: '영웅 - (아란, 에반, 듀블)', value: 'heroes' },
        { label: '전사 - (히어로, 닼나, 팔라딘)', value: 'warrior' },
        { label: '법사 - (비숍, 썬콜, 불독)', value: 'mage' },
        { label: '궁수 - (보마, 신궁)', value: 'archer' },
        { label: '도적 - (나로, 섀도어)', value: 'thief' },
        { label: '해적 - (캡틴, 바이퍼)', value: 'pirate' },
        { label: '버프 - (리저, 리프, 뻥)', value: 'buff' },
      ]);

    const row1 = new ActionRowBuilder().addComponents(registerBtn, searchBtn);
    const row2 = new ActionRowBuilder().addComponents(jobSelect);

    return safeReply(
      interaction,
      {
        components: [row1, row2],
      },
      { ephemeral: true, deleteAfter: 15000 }
    );
  } catch (err) {
    console.error('[프로필 메뉴 오류]', err);
    return safeReply(interaction, '❌ 메뉴 생성 실패', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
