const {
  ChannelType,
  PermissionsBitField,
  MessageFlags,
} = require('discord.js');
const pool = require('../../pg/db');
const { safeReply } = require('../../utils/safeReply');
const { ensureAdmin } = require('../../utils/ensureAdmin');

// 구인글을 채널 생성 직후 즉시 1회 갱신
const updateRecruitMessage = require('../../pg/updateRecruitMessage');

// ---------------- Helper functions ---------------- //

// 등록된 구인글 채널 조회
async function getRegisteredChannel(serverId, guild) {
  const res = await pool.query(
    `
    SELECT channel_id
    FROM bot_channels
    WHERE server_id = $1 AND type = 'recruit'
    `,
    [serverId],
  );

  if (res.rowCount === 0) return null;

  const id = res.rows[0].channel_id;

  // 캐시 → fetch 순서로 안전하게 확인
  return (
    guild.channels.cache.get(id) ||
    (await guild.channels.fetch(id).catch(() => null))
  );
}

// 구인글 채널 생성
async function createRecruitChannel(guild) {
  return await guild.channels.create({
    name: '📢 구인글',
    type: ChannelType.GuildText,
    topic: '무영봇이 관리하는 구인글 전용 채널입니다.',
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        allow: [PermissionsBitField.Flags.ViewChannel],
        deny: [PermissionsBitField.Flags.SendMessages],
      },
    ],
  });
}

// recruit 테이블에 기본 안내문(서버당 1회) 저장
async function ensureRecruitContents(serverId) {
  await pool.query(
    `
    INSERT INTO recruit (server_id, contents)
    VALUES ($1, '')
    ON CONFLICT (server_id)
    DO NOTHING
    `,
    [serverId],
  );
}

// ---------------- Main Handler ---------------- //

module.exports = async (interaction) => {
  const guild = interaction.guild;
  const serverId = guild.id;
  const userId = interaction.user.id;

  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // 1) 관리자 권한 확인
    const isAdmin = await ensureAdmin(serverId, userId);
    if (!isAdmin) {
      return safeReply(interaction, '⚠️ 관리자 전용 버튼입니다.', {
        deleteAfter: 3000,
      });
    }

    // 2) 이미 등록된 recruit 채널 있는지 확인
    const existingChannel = await getRegisteredChannel(serverId, guild);
    if (existingChannel) {
      return safeReply(
        interaction,
        `이미 <#${existingChannel.id}> 채널이 등록되어 있습니다.`,
        { deleteAfter: 3000 },
      );
    }

    // 3) 채널 새로 생성
    const newChannel = await createRecruitChannel(guild);

    // 4) DB 저장(서버별/타입별 1개 유지)
    await pool.query(
      `
      INSERT INTO bot_channels (server_id, channel_id, type)
      VALUES ($1, $2, 'recruit')
      ON CONFLICT (server_id, type)
      DO UPDATE SET channel_id = $2
      `,
      [serverId, newChannel.id],
    );

    // 4.5) recruit 테이블에 기본 안내문 저장 (이미 있으면 절대 덮어쓰기 안함)
    await ensureRecruitContents(serverId);

    // 5) 스케줄러가 따로 있더라도, "만들자마자 구인글 떠있게" 하려면 이게 UX가 좋음.
    await updateRecruitMessage(guild.client, serverId).catch((e) => {
      console.error('[구인글 즉시 갱신 실패]', e);
    });

    // 6) 최종 응답
    return safeReply(
      interaction,
      `✅ 새 구인글 채널 <#${newChannel.id}> 이(가) 생성되었습니다.`,
      { deleteAfter: 3000 },
    );
  } catch (err) {
    console.error('[구인글 채널 생성 오류]', err);
    return interaction.editReply({
      content: '⚠️ 채널 생성 중 오류가 발생했습니다.',
    });
  }
};
