const dayjs = require('dayjs');
const pool = require('../pg/db');
const { buildRecruitMessage } = require('../utils/recruitMessage');
const { getLogicalToday } = require('../utils/getLogicalToday');

module.exports = async function updateRecruitMessage(client, serverId) {
  try {
    const res = await pool.query(
      `
      SELECT channel_id 
      FROM bot_channels 
      WHERE server_id = $1 AND type = 'recruit'
      `,
      [serverId]
    );

    if (res.rowCount === 0) return;
    const channelId = res.rows[0].channel_id;

    const guild = client.guilds.cache.get(serverId);
    if (!guild) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return;

    const logicalKey = getLogicalToday(2 * 60); // 'YYYY-MM-DD'
    const logicalDay = dayjs(logicalKey);

    // 오늘 날짜
    const logicalToday = logicalDay.format('M월 D일 (ddd)');

    // 이전 구인글 메시지 삭제
    const msgs = await channel.messages.fetch({ limit: 50 }).catch(() => null);
    if (msgs) {
      const targetMsgs = msgs.filter((m) => m?.content?.includes(logicalToday));

      for (const m of targetMsgs.values()) {
        await m.delete().catch(() => {});
      }
    }

    // 새 구인글 생성 & 전송
    const msgText = await buildRecruitMessage(client, serverId);
    await channel.send(msgText);

    console.log(`[구인글 자동갱신] ${guild.name} 완료`);
  } catch (err) {
    console.error('[구인글 갱신 오류]', err);
  }
};
