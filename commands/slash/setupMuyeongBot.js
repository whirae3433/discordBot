const {
  SlashCommandBuilder,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const pool = require('../../pg/db');
const { createPanelMessage } = require('../../utils/createPannel');
const { safeReply } = require('../../utils/safeReply');

// ---------------- Helper ---------------- //

// 관리자 권한 확인
async function ensureAdmin(serverId, userId) {
  const check = await pool.query(
    `
    SELECT 1 
    FROM bot_admins 
    WHERE server_id = $1 AND discord_id = $2
    `,
    [serverId, userId]
  );
  return check.rowCount > 0;
}

// panel 채널 존재 여부 조회
async function getPanelChannel(serverId, guild) {
  const res = await pool.query(
    `
    SELECT channel_id
    FROM bot_channels
    WHERE server_id = $1 AND type = 'panel'
    `,
    [serverId]
  );

  if (res.rowCount === 0) return null;

  const id = res.rows[0].channel_id;

  return (
    guild.channels.cache.get(id) ||
    (await guild.channels.fetch(id).catch(() => null))
  );
}

// panel 채널 생성
async function createPanelChannel(guild) {
  return await guild.channels.create({
    name: '🤖무영봇',
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        allow: [PermissionsBitField.Flags.ViewChannel],
        deny: [PermissionsBitField.Flags.SendMessages],
      },
    ],
  });
}

// ---------------- Main ---------------- //
module.exports = {
  data: new SlashCommandBuilder()
    .setName('무영봇')
    .setDescription('무영봇 패널 채널을 생성합니다.'),

  async execute(interaction) {
    const guild = interaction.guild;
    const serverId = guild.id;
    const userId = interaction.user.id;

    try {
      await interaction.deferReply();

      // 초대 링크
      const RAW_REDIRECT = process.env.DISCORD_INVITE_REDIRECT_URI;
      const INVITE_REDIRECT_URI = encodeURIComponent(RAW_REDIRECT || '');
      const INVITE_DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

      const inviteUrl =
        `https://discord.com/oauth2/authorize` +
        `?client_id=${INVITE_DISCORD_CLIENT_ID}` +
        `&permissions=8` +
        `&scope=bot%20identify%20guilds` +
        `&redirect_uri=${INVITE_REDIRECT_URI}` +
        `&response_type=code`;

      const inviteButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('🤖 내 서버에서 사용하기')
          .setStyle(ButtonStyle.Link)
          .setURL(inviteUrl)
      );

      // 관리자 권한 체크
      const isAdmin = await ensureAdmin(serverId, userId);

      if (!isAdmin) {
        return safeReply(
          interaction,
          {
            content: '⚠️ 이 명령어는 관리자만 사용할 수 있습니다.',
            components: [inviteButton],
          },
          { deleteAfter: 5000 }
        );
      }

      // 이미 등록된 channel 조회
      const existingChannel = await getPanelChannel(serverId, guild);

      if (existingChannel) {
        return safeReply(
          interaction,
          `⚠️ 이미 <#${existingChannel.id}> 채널이 등록되어 있습니다.`,
          { ephemeral: false, deleteAfter: 5000 }
        );
      }

      // 새 채널 생성
      const newChannel = await createPanelChannel(guild);

      // DB 저장
      await pool.query(
        `
        INSERT INTO bot_channels (server_id, channel_id, type)
        VALUES ($1, $2, 'panel')
        ON CONFLICT (server_id, type)
        DO UPDATE SET channel_id = $2
        `,
        [serverId, newChannel.id]
      );

      // 패널 메시지 전송
      const panelMessage = await createPanelMessage(
        interaction.client,
        guild,
        serverId
      );
      await newChannel.send(panelMessage);

      // 성공 메시지 (🟢 새 채널 기준!)
      return safeReply(
        interaction,
        `<#${newChannel.id}> 채널이 생성되었습니다!`,
        { deleteAfter: 5000 }
      );
    } catch (err) {
      console.error('[무영봇 패널 생성 오류]', err);
      return interaction.editReply(`⚠️ 패널 채널 생성 중 오류가 발생했습니다.`);
    }
  },
};
