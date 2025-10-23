const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  name: '!무영봇설정',
  description: '고정 안내 메시지 + 버튼 UI를 전송합니다.',
  execute: async (message) => {
    // 💥 유저의 "!무영봇설정" 메시지 삭제
    if (message.deletable) {
      await message.delete().catch(console.error);
    }

    const embed = new EmbedBuilder()
      .setTitle('🔧 무영봇 테스트 패널')
      .setDescription(['무영무영', '버튼을 누르기.'].join('\n'))
      .setColor(0x00ae86)
      .setFooter({
        text: '무영봇 v1.0.0',
        iconURL: message.client.user.displayAvatarURL(),
      });

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('member_list')
        .setLabel('📋 멤버 목록')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('set_amount')
        .setLabel('💰 먹자 금액')
        .setStyle(ButtonStyle.Success)
      // new ButtonBuilder()
      //   .setCustomId('member_add')
      //   .setLabel('➕ 멤버 추가')
      //   .setStyle(ButtonStyle.Success),
      // new ButtonBuilder()
      //   .setCustomId('member_edit')
      //   .setLabel('✏️ 멤버 수정')
      //   .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      // new ButtonBuilder()
      //   .setCustomId('raid_manage')
      //   .setLabel('🗓️ 레이드 관리')
      //   .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('guest_reserve')
        .setLabel('✏️ 손님 예약')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('guest_list')
        .setLabel('📋 손님 현황')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('easter_egg')
        .setLabel('🚫 클릭 금지')
        .setStyle(ButtonStyle.Danger)
    );

    const sent = await message.channel.send({
      embeds: [embed],
      components: [row1, row2],
    });

    // sent.id 를 저장해두면 나중에 이 메시지를 수정하거나 복구 가능
  },
};
