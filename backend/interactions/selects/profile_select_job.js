const { safeReply } = require('../../utils/safeReply');
const { updateProfileChannel } = require('../../pg/updateProfileChannel');
const jobGroups = require('../../utils/jobGroups');
const pool = require('../../pg/db'); // bot_channels 조회용 (경로 네 프로젝트에 맞춰)

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const selected = interaction.values[0]; // ex: 'heroes'

  try {
    const jobOrder = jobGroups[selected];
    if (!jobOrder) {
      return safeReply(interaction, '❌ 알 수 없는 직업 그룹입니다.', {
        ephemeral: true,
        deleteAfter: 3000,
      });
    }

    // 프로필 채널 id 가져오기 (링크용)
    const res = await pool.query(
      `
      SELECT channel_id
      FROM bot_channels
      WHERE server_id = $1 AND type = 'profile'
      `,
      [serverId]
    );

    if (res.rowCount === 0) {
      return safeReply(
        interaction,
        '❌ 프로필 채널이 설정되어 있지 않습니다.',
        {
          ephemeral: true,
          deleteAfter: 3000,
        }
      );
    }

    const channelId = res.rows[0].channel_id;
    const channel = interaction.guild.channels.cache.get(channelId);
    const channelName = channel?.name ?? '프로필 채널';

    // 갱신 시작 알림 (바로 reply 해서 인터랙션 타임아웃 방지)
    await interaction.reply({
      content: `🔄 선택한 직업군 기준으로 정리하고 있어요...\n잠시만 기다려줘!`,
      flags: 64, // ephemeral
    });

    // 프로필 채널 전체 갱신: 선택 직업군만 + IGN 순
    // (updateProfileChannel에 jobFilter 적용/IGN 정렬 로직 넣은 상태 기준)
    await updateProfileChannel(global.botClient, serverId, null, jobOrder);

    // 완료 안내 + 채널 바로가기
    await interaction.editReply({
      content:
        ` **${channelName}**에서 확인해줘 → <#${channelId}>\n` +
        `⏱️ 이 메시지는 20초 후 자동 삭제됩니다.`,
      flags: 64,
    });

    // 안내 메시지 자동 삭제 (ephemeral이라 deleteReply 가능)
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 20000);
  } catch (err) {
    console.error('[직업별 조회 오류]', err);
    return safeReply(interaction, '❌ 직업 조회 중 오류가 발생했습니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
