const { ChannelType, PermissionsBitField } = require('discord.js');
const pool = require('../../pg/db');
const { safeReply } = require('../../utils/safeReply');
const { ensureAdmin } = require('../../utils/ensureAdmin');

// ---------------- Helper functions ---------------- //

// 등록된 채널 조회
async function getRegisteredChannel(serverId, guild) {
  const res = await pool.query(
    `
    SELECT channel_id 
    FROM bot_channels 
    WHERE server_id = $1 AND type = 'guest_status'
    `,
    [serverId]
  );

  if (res.rowCount === 0) return null;

  const id = res.rows[0].channel_id;

  // 캐시 → fetch 순서로 최적화된 조회
  return (
    guild.channels.cache.get(id) ||
    (await guild.channels.fetch(id).catch(() => null))
  );
}

// 채널 생성
async function createGuestStatusChannel(guild, userId) {
  return await guild.channels.create({
    name: '🪪 손님현황',
    type: ChannelType.GuildText,
    topic: '무영봇이 관리하는 손님 예약 현황 채널입니다.',
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        allow: [PermissionsBitField.Flags.ViewChannel],
        deny: [PermissionsBitField.Flags.SendMessages],
      },
      {
        id: userId,
        allow: [PermissionsBitField.Flags.SendMessages],
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
    // 1. 관리자 권한 확인
    const isAdmin = await ensureAdmin(serverId, userId);
    if (!isAdmin) {
      return safeReply(interaction, '⚠️ 관리자 전용 버튼입니다.', {
        deleteAfter: 3000,
      });
    }

    // 2. DB에서 등록된 채널 조회
    const existingChannel = await getRegisteredChannel(serverId, guild);

    if (existingChannel) {
      return safeReply(
        interaction,
        `이미 <#${existingChannel.id}> 채널이 등록되어 있습니다.`,
        { deleteAfter: 3000 }
      );
    }

    // 3. 채널 새로 생성
    const newChannel = await createGuestStatusChannel(guild, userId);

    // 4. DB 저장 or 갱신
    await pool.query(
      `
      INSERT INTO bot_channels (server_id, channel_id, type)
      VALUES ($1, $2, 'guest_status')
      ON CONFLICT (server_id, type)
      DO UPDATE SET channel_id = $2
       `,
      [serverId, newChannel.id]
    );

    return safeReply(
      interaction,
      `✅ 새 채널 <#${newChannel.id}> 이(가) 생성되었습니다.`,
      { deleteAfter: 3000 }
    );
  } catch (err) {
    console.error('[손님 현황 채널 생성 오류]', err);

    return safeReply(interaction, '⚠️ 채널 생성 중 오류가 발생했습니다.', {
      deleteAfter: 3000,
    });
  }
};
