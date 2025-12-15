const { ChannelType, PermissionsBitField, MessageFlags } = require('discord.js');
const pool = require('../../pg/db');
const { safeReply } = require('../../utils/safeReply');
const { updateProfileChannel } = require('../../pg/updateProfileChannel');

// ---------------- Helper functions ---------------- //

// 관리자 권한 체크
async function ensureAdmin(serverId, userId) {
  const check = await pool.query(
    `
    SELECT 1 FROM bot_admins 
    WHERE server_id = $1 AND discord_id = $2
    `,
    [serverId, userId]
  );
  return check.rowCount > 0;
}

// 등록된 프로필 채널 조회
async function getRegisteredChannel(serverId, guild) {
  const res = await pool.query(
    `
    SELECT channel_id 
    FROM bot_channels 
    WHERE server_id = $1 AND type = 'profile'
    `,
    [serverId]
  );

  if (res.rowCount === 0) return null;

  const id = res.rows[0].channel_id;

  // 캐시 → fetch 순서로 안전하게 확인
  return (
    guild.channels.cache.get(id) ||
    (await guild.channels.fetch(id).catch(() => null))
  );
}

// 프로필 채널 생성
async function createProfileChannel(guild, userId) {
  return await guild.channels.create({
    name: '📘길드원-프로필',
    type: ChannelType.GuildText,
    topic: '무영봇이 관리하는 길드원 프로필 전용 채널입니다.',
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        allow: [PermissionsBitField.Flags.ViewChannel],
        deny: [PermissionsBitField.Flags.SendMessages],
      },
    ],
  });
}

// ---------------- Main Handler ---------------- //

module.exports = async (interaction) => {
  const guild = interaction.guild;
  const serverId = guild.id;
  const userId = interaction.user.id;

  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    // 1. 관리자 권한 확인
    const isAdmin = await ensureAdmin(serverId, userId);
    if (!isAdmin) {
      return safeReply(interaction, '⚠️ 관리자 전용 버튼입니다.', {
        deleteAfter: 3000,
      });
    }

    // 2. DB에서 등록된 프로필 채널 조회
    const existingChannel = await getRegisteredChannel(serverId, guild);

    if (existingChannel) {
      return safeReply(
        interaction,
        `이미 <#${existingChannel.id}> 채널이 등록되어 있습니다.`,
        { deleteAfter: 3000 }
      );
    }

    // 3. 채널 새로 생성
    const newChannel = await createProfileChannel(guild, userId);

    // 4. DB 저장 or 갱신
    await pool.query(
      `
      INSERT INTO bot_channels (server_id, channel_id, type)
      VALUES ($1, $2, 'profile')
      ON CONFLICT (server_id, type)
      DO UPDATE SET channel_id = $2
       `,
      [serverId, newChannel.id]
    );

    // 채널 생성 후 전체 프로필 출력 추가
    await updateProfileChannel(guild.client, serverId);

    // 최종 응답
    return safeReply(
      interaction,
      `✅ 새 프로필 채널 <#${newChannel.id}> 이(가) 생성되었습니다.`,
      { deleteAfter: 3000 }
    );
  } catch (err) {
    console.error('[프로필 채널 생성 오류]', err);
    return interaction.editReply({
      content: '⚠️ 채널 생성 중 오류가 발생했습니다.',
    });
  }
};
