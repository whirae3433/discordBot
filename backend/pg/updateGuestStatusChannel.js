const { getGuestListByDate } = require('../pg/selectGuestList');
const { buildGuestStatusEmbed } = require('../utils/buildGuestStatusEmbed');
const { getLogicalToday } = require('../utils/getLogicalToday');
const pool = require('../pg/db');

async function updateGuestStatusChannel(client, serverId, options = {}) {
  const logicalToday = getLogicalToday(2 * 60);

  try {
    const guild = await client.guilds.fetch(serverId);

    // 채널 ID 조회
    const res = await pool.query(
      `
      SELECT channel_id 
      FROM bot_channels 
      WHERE server_id = $1 AND type = 'guest_status'
      `,
      [serverId]
    );
    if (res.rowCount === 0) return;

    const channelId = res.rows[0].channel_id;
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    // 오늘 기준 손님 조회
    const grouped = await getGuestListByDate(serverId, 'today');

    // 기존 메시지 모두 삭제 (오늘만)
    const msgs = await channel.messages.fetch({ limit: 50 }).catch(() => null);
    if (msgs) {
      const targetMsgs = msgs.filter((m) =>
        m.embeds.some((e) => (e.description || '').includes(logicalToday))
      );
      for (const m of targetMsgs.values()) {
        await m.delete().catch(() => {});
      }
    }

    // 빈 데이터 처리 포함 내부 embed 생성
    const embeds = await buildGuestStatusEmbed(
      { [logicalToday]: grouped[logicalToday] },
      guild
    );

    await channel.send({ embeds });

    console.log(`[손님 현황] ${logicalToday} 업데이트 완료`);
  } catch (err) {
    console.error('[손님 현황 갱신 오류]', err);
  }
}

/**
 * 안전 버전: 에러 발생해도 봇이 멈추지 않음
 * (updateGuestStatusChannel 내부 에러를 자체적으로 처리)
 */
async function safeUpdateGuestStatusChannel(client, serverId, options = {}) {
  try {
    await updateGuestStatusChannel(client, serverId, options);
  } catch (err) {
    console.error('[safeUpdateGuestStatusChannel] 오류 무시됨:', err);
  }
}

module.exports = { updateGuestStatusChannel, safeUpdateGuestStatusChannel };
