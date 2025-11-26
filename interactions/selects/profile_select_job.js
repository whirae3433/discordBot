const { safeReply } = require('../../utils/safeReply');
const { createProfileEmbed } = require('../../utils/embedHelper');
const { getProfileObjects } = require('../../utils/getProfileObjects');
const jobGroups = require('../../utils/jobGroups');

module.exports = async (interaction) => {
  const serverId = interaction.guild.id;
  const selected = interaction.values[0]; // ex) 'warrior'

  try {
    const targets = jobGroups[selected];
    if (!targets) {
      return safeReply(interaction, '❌ 알 수 없는 직업 그룹입니다.', {
        ephemeral: true,
        deleteAfter: 3000,
      });
    }

    // DB 전체 프로필 조회
    const allProfiles = await getProfileObjects(serverId);

    // 직업별 필터링
    const filtered = allProfiles.filter((p) =>
      targets.includes(p.jobName)
    );

    if (!filtered.length) {
      return safeReply(
        interaction,
        `❌ 캐릭터가 없습니다.`,
        { ephemeral: true, deleteAfter: 3000 }
      );
    }

    // IGN 기준 그룹화
    const grouped = filtered.reduce((acc, p) => {
      if (!acc[p.ign]) acc[p.ign] = [];
      acc[p.ign].push(p);
      return acc;
    }, {});

    // Embed 묶기
    const embedList = [];
    for (const chars of Object.values(grouped)) {
      const [main, ...rest] = chars;
      const embedObj = await createProfileEmbed(main, rest);
      embedList.push(...embedObj.embeds);
    }

    // 응답
    await interaction.reply({
      embeds: embedList,
      flags: 64, // ephemeral
    });

    // 자동 삭제 (20초)
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (e) {}
    }, 20000);
  } catch (err) {
    console.error('[직업별 조회 오류]', err);
    return safeReply(interaction, '❌ 직업 조회 중 오류가 발생했습니다.', {
      ephemeral: true,
      deleteAfter: 3000,
    });
  }
};
