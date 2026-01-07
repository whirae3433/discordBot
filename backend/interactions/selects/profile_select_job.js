const { safeReply } = require('../../utils/safeReply');
const { createProfileEmbed } = require('../../utils/embedHelper');
const { getProfileObjects } = require('../../utils/getProfileObjects');
const { updateProfileChannel } = require('../../pg/updateProfileChannel');
const jobGroups = require('../../utils/jobGroups');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

    // 전체 프로필 가져오기
    const allProfiles = await getProfileObjects(serverId);

    const embeds = [];
    const ignToUpdate = new Set();

    // 직업 순서대로 반복
    for (const jobName of jobOrder) {
      // 1-1) 해당 job 필터
      const jobFiltered = allProfiles.filter((p) => p.jobName === jobName);
      if (!jobFiltered.length) continue;

      // IGN으로 그룹화
      const groupedByIgn = jobFiltered.reduce((acc, p) => {
        if (!acc[p.ign]) acc[p.ign] = [];
        acc[p.ign].push(p);
        return acc;
      }, {});

      // IGN 순서대로 embed 생성
      for (const [ign, chars] of Object.entries(groupedByIgn)) {
        if (!Array.isArray(chars) || chars.length === 0) continue;
        
        const [main, ...rest] = chars;
        const embedObj = await createProfileEmbed(main, rest);
        embeds.push(...embedObj.embeds);

        ignToUpdate.add(ign);
      }
    }

    if (!embeds.length) {
      return safeReply(interaction, '❌ 해당 직업 캐릭터가 없습니다.', {
        ephemeral: true,
        deleteAfter: 3000,
      });
    }

    // 응답
    await interaction.reply({
      embeds,
      flags: 64, // ephemeral
    });

    // 프로필 채널 부분 갱신(백그라운드처럼 돌리되 과부하 방지)
    (async () => {
      for (const ign of ignToUpdate) {
        try {
          await updateProfileChannel(global.botClient, serverId, ign);
          await sleep(150); // 0.15초 텀(필요하면 300~500으로 늘려)
        } catch (err) {
          console.error('[직업 조회 기반 프로필 갱신 오류]', err);
        }
      }
    })();

    // 자동 삭제 20초
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
