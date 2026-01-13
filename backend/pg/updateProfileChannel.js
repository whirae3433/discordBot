const pool = require('./db');
const { createProfileEmbed } = require('../utils/embedHelper');
const { getProfileObjects } = require('../utils/getProfileObjects');

async function updateProfileChannel(
  client,
  serverId,
  targetIGN = null,
  jobFilter = null
) {
  try {
    // DB에서 프로필 채널 ID 찾기
    const res = await pool.query(
      `
      SELECT channel_id 
      FROM bot_channels
      WHERE server_id = $1 AND type = 'profile'
      `,
      [serverId]
    );
    if (res.rowCount === 0) return;

    const channelId = res.rows[0].channel_id;
    const guild = client.guilds.cache.get(serverId);
    if (!guild) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;

    let list = await getProfileObjects(serverId);

    if (Array.isArray(jobFilter) && jobFilter.length > 0) {
      const set = new Set(jobFilter);
      list = list.filter((p) => set.has(p.jobName));
    }

    if (!targetIGN) {
      console.log(
        `[updateProfileChannel] 전체(추가) 실행${
          jobFilter?.length ? ` (직업필터 ${jobFilter.length}개)` : ''
        }`
      );

      const grouped = list.reduce((acc, p) => {
        if (!acc[p.ign]) acc[p.ign] = [];
        acc[p.ign].push(p);
        return acc;
      }, {});

      // IGN 순 정렬
      const ignKeys = Object.keys(grouped).sort((a, b) =>
        a.localeCompare(b, 'ko')
      );

      for (const ign of ignKeys) {
        const chars = grouped[ign];
        const [main, ...rest] = chars;
        const embedObj = await createProfileEmbed(main, rest);
        await channel.send(embedObj);
      }

      return;
    }

    // ===== 부분 추가 모드 =====
    console.log(
      `[updateProfileChannel] 부분(추가) 실행: ${targetIGN}${
        jobFilter?.length ? ` (직업필터 ${jobFilter.length}개)` : ''
      }`
    );

    const filtered = list.filter((p) => p.ign === targetIGN);

    if (!filtered.length) {
      console.log(`[updateProfileChannel] IGN '${targetIGN}' 없음`);
      return;
    }

    const [main, ...rest] = filtered;
    const embedObj = await createProfileEmbed(main, rest);
    await channel.send(embedObj);

    console.log(`[프로필 갱신(추가) 완료] ${targetIGN}`);
  } catch (err) {
    console.error('[updateProfileChannel 오류]', err);
  }
}

module.exports = { updateProfileChannel };
