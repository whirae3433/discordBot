const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const pool = require('../pg/db');

async function createPanelMessage(client, guild, serverId) {
  const guildName = guild.name;

  // 초대 링크 생성
  const RAW_REDIRECT = process.env.DISCORD_INVITE_REDIRECT_URI; // e.g. http://localhost:3000/api/invite/callback
  const INVITE_REDIRECT_URI = encodeURIComponent(RAW_REDIRECT || '');
  const INVITE_DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

  const inviteUrl =
    `https://discord.com/oauth2/authorize` +
    `?client_id=${INVITE_DISCORD_CLIENT_ID}` +
    `&permissions=8` +
    `&scope=bot%20identify%20guilds` +
    `&redirect_uri=${INVITE_REDIRECT_URI}` +
    `&response_type=code`;

  // 메인 관리자 정보 조회
  let adminName = null;
  let thumbnailUrl = client.user.displayAvatarURL();

  try {
    const res = await pool.query(
      `SELECT discord_id FROM bot_admins 
       WHERE server_id = $1 AND is_main_admin = TRUE LIMIT 1`,
      [serverId]
    );

    if (res.rowCount > 0) {
      const adminId = res.rows[0].discord_id;
      const member = await guild.members.fetch(adminId).catch(() => null);
      if (member) {
        adminName = member.displayName || member.user.username;
        thumbnailUrl =
          member.user.displayAvatarURL({
            dynamic: true,
            size: 256,
          }) || thumbnailUrl;
      }
    }
  } catch (err) {
    console.error('[패널 관리자 조회 오류]', err);
  }

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
        value: ['• 채널 생성 메뉴', '• 손님 금액 설정','• 인센 금액 설정'].join('\n'),
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
      // message 대신 client 사용
      iconURL: client.user.displayAvatarURL(),
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

    new ButtonBuilder()
      .setCustomId('button_profile_menu')
      .setLabel('👤 길드원 프로필')
      .setStyle(ButtonStyle.Success)
  );

  // 두 번째 줄 (관리자용)
  const rowAdmin = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('button_channel_menu')
      .setLabel('🛠️ 채널 생성 메뉴')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('set_amount')
      .setLabel('💰 손님 금액 설정')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('button_incentive_set')
      .setLabel('💵 인센 금액 설정')
      .setStyle(ButtonStyle.Secondary)
  );

  // 세 번째 줄 (공개 초대 링크)
  const rowPublic = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('🤖 내 서버에서 사용하기')
      .setStyle(ButtonStyle.Link)
      .setURL(inviteUrl)
  );

  return {
    embeds: [embed],
    components: [rowUser, rowAdmin, rowPublic],
  };
}

module.exports = { createPanelMessage };
