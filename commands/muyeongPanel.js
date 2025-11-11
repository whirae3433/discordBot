const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const pool = require('../pg/db');

module.exports = {
  name: '!무영봇설정',
  description: '고정 안내 메시지 + 버튼 UI를 전송합니다.',
  execute: async (message) => {
    // DM에서 실행 방지
    if (!message.guild) {
      return message.reply('이 명령어는 서버 채널에서만 사용 가능합니다.');
    }

    const serverId = message.guild.id;
    const guildName = message.guild.name;

    // 1) 최근 패널 메시지 정리 (봇이 보낸 것 + 제목이 "*원정대 관리 패널")
    try {
      const recent = await message.channel.messages.fetch({ limit: 50 });
      const oldPanels = recent.filter((m) => {
        return (
          m.author.id === message.client.user.id &&
          m.embeds?.[0]?.title?.endsWith('패널')
        );
      });
      for (const m of oldPanels.values()) {
        await m.delete().catch(() => {});
      }
    } catch (err) {
      console.warn('[이전 패널 삭제 경고]', err?.message);
    }

    // 2) 사용자의 커맨드 메시지 삭제 (깔끔하게)
    if (message.deletable) {
      await message.delete().catch(() => {});
    }

    // 메인 관리자 정보 불러오기
    let adminName = null;
    let thumbnailUrl = message.client.user.displayAvatarURL(); // fallback: 봇 아바타

    try {
      const res = await pool.query(
        `SELECT discord_id
           FROM bot_admins
          WHERE server_id = $1 AND is_main_admin = TRUE
          LIMIT 1`,
        [serverId]
      );

      if (res.rowCount > 0) {
        const mainAdminId = res.rows[0].discord_id;
        try {
          const member = await message.guild.members.fetch(mainAdminId);
          adminName = member.displayName || member.user.username;
          thumbnailUrl =
            member.user.displayAvatarURL({ dynamic: true, size: 256 }) ||
            thumbnailUrl;
        } catch (e) {
          console.warn('[관리자 아바타 조회 실패]', mainAdminId, e?.message);
        }
      }
    } catch (e) {
      console.error('[DB 조회 오류]', e);
    }

    const RAW_REDIRECT = process.env.DISCORD_INVITE_REDIRECT_URI; // e.g. http://localhost:3000/api/invite/callback
    const INVITE_REDIRECT_URI = encodeURIComponent(RAW_REDIRECT);
    const INVITE_DiSCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const inviteUrl =
      `https://discord.com/oauth2/authorize` +
      `?client_id=${INVITE_DiSCORD_CLIENT_ID}` +
      `&permissions=8` +
      `&scope=bot%20identify%20guilds` +
      `&redirect_uri=${INVITE_REDIRECT_URI}` +
      `&response_type=code`;

    const embed = new EmbedBuilder()
      .setTitle(`${guildName} 패널`)
      .setColor(0x2ecc71)
      .setThumbnail(thumbnailUrl)
      .setDescription(
        [
          adminName
            ? `안녕하세요, 서버 관리자 **${adminName}** 입니다.`
            : '안녕하세요, 서버 관리자입니다.',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        ].join('\n')
      )
      .addFields(
        {
          name: '👤 일반 사용자 기능',
          value: [
            '• 손님 예약/조회',
            '• 예약 수정/삭제',
            '• 프로필 등록/조회',
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
          value: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
          inline: true,
        }
      )
      .setFooter({
        text: '무영봇 v1.0.0 | Powered by Discord.js',
        iconURL: message.client.user.displayAvatarURL(),
      });

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

      new ButtonBuilder() //
        .setCustomId('button_profile_register')
        .setLabel('👤 프로필 등록/조회')
        .setStyle(ButtonStyle.Success)
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
    const rowPublic = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🤖 내 서버에서 사용하기')
        .setStyle(ButtonStyle.Link)
        .setURL(inviteUrl)
    );
    await message.channel.send({
      embeds: [embed],
      components: [rowUser, rowAdmin, rowPublic],
    });
  },
};
