const { safeReply } = require('../../utils/safeReply');
const { getProfilesByNickname } = require('../../utils/getProfile');
const { createProfileEmbed } = require('../../utils/embedHelper');
const { updateProfileChannel } = require('../../pg/updateProfileChannel');
const { MessageFlags } = require('discord-api-types/v10');

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

    const embedList = [];

    const grouped = profiles.reduce((acc, p) => {
      if (!acc[p.ign]) acc[p.ign] = [];
      acc[p.ign].push(p);
      return acc;
    }, {});

    for (const [ign, chars] of Object.entries(grouped)) {
      const [main, ...rest] = chars;
      const embedObj = await createProfileEmbed(main, rest);
      embedList.push(...embedObj.embeds); // embeds 배열을 풀어서 넣기

      // 프로필 채널 부분 갱신 추가
      updateProfileChannel(global.botClient, serverId, ign).catch((err) =>
        console.error('[검색 기반 프로필 갱신 오류]', err)
      );
    }

    await interaction.reply({
      embeds: embedList,
      flags: MessageFlags.Ephemeral,
    });

    // 20초 후 자동 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (e) {
        console.log('[검색 결과 삭제 실패 - 무시됨]', e.message);
      }
    }, 20000);
  } catch (err) {
    console.error('[검색 모달 오류]', err);
    return safeReply(interaction, '❌ 검색 중 오류가 발생했습니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
