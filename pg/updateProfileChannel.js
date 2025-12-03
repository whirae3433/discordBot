const pool = require('./db');
const { createProfileEmbed } = require('../utils/embedHelper');
const { getProfileObjects } = require('../utils/getProfileObjects');

async function updateProfileChannel(client, serverId, targetIGN = null) {
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

    const list = await getProfileObjects(serverId);

    if (!targetIGN) {
      console.log(`[updateProfileChannel] 전체 갱신 실행`);

      const messages = await channel.messages.fetch().catch(() => null);

      if (messages) {
        for (const m of messages.values()) {
          await m.delete().catch(() => {});
        }
      }

      const grouped = list.reduce((acc, p) => {
        if (!acc[p.ign]) acc[p.ign] = [];
        acc[p.ign].push(p);
        return acc;
      }, {});

      for (const chars of Object.values(grouped)) {
        const [main, ...rest] = chars;
        const embedObj = await createProfileEmbed(main, rest);
        await channel.send(embedObj);
      }

      return;
    }

    // 특정 IGN만 갱신 모드
    console.log(`[updateProfileChannel] 부분 갱신: ${targetIGN}`);

    const messages = await channel.messages.fetch().catch(() => null);

    if (messages) {
      for (const msg of messages.values()) {
        const embed = msg.embeds?.[0];
        if (embed?.title === `${targetIGN}님의 프로필`) {
          await msg.delete().catch(() => {});
        }
      }
    }

    const filtered = list.filter((p) => p.ign === targetIGN);

    if (!filtered.length) {
      console.log(`[updateProfileChannel] IGN '${targetIGN}' 없음`);
      return;
    }

    // 새 embed 출력 (IGN 하나 → embed 하나)
    const [main, ...rest] = filtered;
    const embedObj = await createProfileEmbed(main, rest);

    await channel.send(embedObj);

    console.log(`[프로필 갱신 완료] ${targetIGN}`);
  } catch (err) {
    console.error('[updateProfileChannel 오류]', err);
  }
}

module.exports = { updateProfileChannel };
