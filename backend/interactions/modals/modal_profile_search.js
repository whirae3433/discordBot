const { safeReply } = require('../../utils/safeReply');
const { getProfilesByNickname } = require('../../utils/getProfile');
const { updateProfileChannel } = require('../../pg/updateProfileChannel');
const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async (interaction) => {
  const query = interaction.fields.getTextInputValue('search_nickname')?.trim();
  const serverId = interaction.guild.id;

  try {
    const profiles = await getProfilesByNickname(interaction, query);

    if (!profiles.length) {
      return safeReply(
        interaction,
        `❌ '${query}'에 해당하는 길드원을 찾지 못했어요.`,
        {
          ephemeral: true,
          deleteAfter: 3000,
        }
      );
    }

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

    // IGN 목록 뽑기 (중복 제거)
    const ignSet = new Set(profiles.map((p) => p.ign).filter(Boolean));
    const ignList = [...ignSet].sort((a, b) => a.localeCompare(b, 'ko'));

    // ✅ 먼저 응답(타임아웃 방지)
    await interaction.reply({
      content:
        `🔎 검색 결과를 조회중이에요 ...\n` +
        `(${ignList.length}명) 잠시만 기다려줘!`,
      flags: MessageFlags.Ephemeral,
    });

    // ✅ 프로필 채널에 "IGN별로" 갱신(추가)
    // (검색은 IGN의 모든 캐릭터가 나와야 하니 jobFilter는 넘기지 않음)
    for (const ign of ignList) {
      try {
        await updateProfileChannel(global.botClient, serverId, ign);
        await sleep(150);
      } catch (err) {
        console.error('[검색 기반 프로필 갱신 오류]', err);
      }
    }

    // 완료 안내 + 채널 바로가기
    await interaction.editReply({
      content:
        `**[#${channelName}]** 에서 확인해줘 → <#${channelId}>\n` +
        `⏱️ 이 메시지는 20초 후 자동 삭제됩니다.`,
      flags: MessageFlags.Ephemeral,
    });

    // 안내 메시지 자동 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 20000);
  } catch (err) {
    console.error('[검색 모달 오류]', err);
    return safeReply(interaction, '❌ 검색 중 오류가 발생했습니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
