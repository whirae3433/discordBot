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
      .setTitle('⚔️ 로나 원정대 관리 패널')
      .setDescription(
        [
          '안녕하세요, **무영봇 관리자**입니다.',
          '아래의 기능 버튼을 통해 테스트를 진행할 수 있습니다.',
          '',
          '🟢 **정상 작동 시** : 성공 메시지 또는 로그가 표시됩니다.',
          '🔴 **오류 발생 시** : 콘솔 로그와 함께 오류 알림이 전송됩니다.',
        ].join('\n')
      )
      .setColor(0x2ecc71) // 세련된 민트-그린
      .setThumbnail(message.client.user.displayAvatarURL())
      .addFields(
        {
          name: '📡 시스템 상태',
          value: '정상 작동 중 ✅',
          inline: true,
        },
        {
          name: '🕒 마지막 업데이트',
          value: '2025-10-30 14:30 (KST)',
          inline: true,
        },
        {
          name: '💾 서버 연결',
          value: 'PostgreSQL / AWS EC2 / Discord API 연동 완료',
        }
      )
      .setFooter({
        text: '무영봇 v1.0.0 | Powered by Discord.js',
        iconURL: message.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      // new ButtonBuilder()
      //   .setCustomId('raid_manage')
      //   .setLabel('🗓️ 레이드 관리')
      //   .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('button_guest_reserve')
        .setLabel('📋 손님 예약/조회')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('button_guest_status')
        .setLabel('✏️ 예약 수정/삭제')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('set_amount')
        .setLabel('💰 먹자 금액 설정')
        .setStyle(ButtonStyle.Success)
    );

    const sent = await message.channel.send({
      embeds: [embed],
      components: [row1],
    });

    // sent.id 를 저장해두면 나중에 이 메시지를 수정하거나 복구 가능
  },
};
