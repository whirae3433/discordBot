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
    // 기존 패널 메시지(봇이 보냈던 것) 싹 지우기 (이전 ENV로 만든 버튼 클릭 방지)
    try {
      const recent = await message.channel.messages.fetch({ limit: 50 });
      const oldPanels = recent.filter(
        (m) =>
          m.author.id === message.client.user.id &&
          m.embeds?.[0]?.title === '로나 원정대 관리 패널'
      );
      for (const m of oldPanels.values()) {
        await m.delete().catch(() => {});
      }
    } catch {}

    // 유저의 "!무영봇설정" 메시지 삭제
    if (message.deletable) {
      await message.delete().catch(console.error);
    }

    const RAW_REDIRECT = process.env.DISCORD_INVITE_REDIRECT_URI; // e.g. http://localhost:3000/api/invite/callback
    const INVITE_REDIRECT_URI = encodeURIComponent(RAW_REDIRECT);
    const inviteUrl =
      `https://discord.com/oauth2/authorize` +
      `?client_id=1394227164144074862` +
      `&permissions=8` +
      `&scope=bot%20identify` + // identify도 필요하면 포함
      `&redirect_uri=${INVITE_REDIRECT_URI}` +
      `&response_type=code`;

    const embed = new EmbedBuilder()
      .setTitle('로나 원정대 관리 패널')
      .setColor(0x2ecc71)
      .setThumbnail(message.client.user.displayAvatarURL())
      .setDescription(
        [
          '네. 맞아요. 제가 바로 무영이에요. \n',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        ].join('\n')
      )
      .addFields(
        {
          name: '👤 일반 사용자 기능',
          value: [
            '• 손님 예약/조회',
            '• 예약 수정/삭제',
            '• 무영이 사용하기',
          ].join('\n'),
          inline: true,
        },
        { name: '\u200B', value: '\u200B', inline: true },
        {
          name: '🛠️ 관리자 전용 기능',
          value: ['• 현황 채널 생성', '• 손님 금액 설정'].join('\n'),
          inline: true,
        }
      )
      .addFields({
        name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        value: '',
        inline: false,
      })
      .addFields(
        {
          name: '시스템 상태',
          value: '정상 작동 중 ✅',
          inline: true,
        },
        {
          name: '마지막 업데이트',
          value: '2025-11-04 14:30 (KST)',
          inline: true,
        }
      )
      .setFooter({
        text: '무영봇 v1.0.0 | Powered by Discord.js',
        iconURL: message.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    // 첫 번째 줄 (일반 사용자용)
    const rowUser = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('button_guest_reserve')
        .setLabel('📋 손님 예약/조회')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('button_guest_status')
        .setLabel('✏️ 예약 수정/삭제')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setLabel('🤖 무영이 사용하기')
        .setStyle(ButtonStyle.Link)
        .setURL(inviteUrl)
    );
    // 두 번째 줄 (관리자용)
    const rowAdmin = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('button_create_guest_status_channel')
        .setLabel('🪪 현황 채널 생성')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('set_amount')
        .setLabel('💰 손님 금액 설정')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('button_set_incentive')
        .setLabel('💵 인센 금액 설정')
        .setStyle(ButtonStyle.Secondary)
    );

    await message.channel.send({
      embeds: [embed],
      components: [rowUser, rowAdmin],
    });
  },
};
