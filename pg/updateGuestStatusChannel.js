const { buildGuestStatusEmbed } = require('../utils/buildGuestStatusEmbed');
const { getLogicalToday } = require('../utils/getLogicalToday');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const pool = require('../pg/db');

/**
 * 손님 현황 메시지를 갱신 (논리적 오늘 기준)
 * @param {Client} client Discord 클라이언트
 * @param {string} serverId 서버 ID
 * @param {object} [options]
 * @param {number} [options.cutoffMinutes=60] 자정 이후 몇 분까지 전날로 볼지 (기본 60분)
 */

async function updateGuestStatusChannel(client, serverId, options = {}) {
  const { cutoffMinutes = 90 } = options;
  const logicalToday = getLogicalToday(cutoffMinutes);
  try {
    const guild = await client.guilds.fetch(serverId);

    // 채널 ID 조회
    const res = await pool.query(
      `SELECT channel_id FROM bot_channels WHERE server_id = $1 AND type = 'guest_status'`,
      [serverId]
    );

    if (res.rowCount === 0) {
      console.log(`[손님 현황] ${guild.name} 서버에 등록된 채널 ID 없음`);
      return;
    }

    const channelId = res.rows[0].channel_id;
    const channel =
      guild.channels.cache.get(channelId) ||
      (await guild.channels.fetch(channelId).catch(() => null));

    if (!channel) {
      console.log(
        `[손님 현황] ${guild.name} 서버의 채널(${channelId})을 찾을 수 없음`
      );
      return;
    }

    // Embed 생성 (모든 날짜)
    const embeds = await buildGuestStatusEmbed({ guild }, serverId);

    // 오늘 날짜 embed만 추출
    const targetEmbed  = embeds.find((e) => {
      const t = e.data.title || '';
      const d = e.data.description || '';
      return t.includes(logicalToday) || d.includes(logicalToday);
    });

    if (!targetEmbed) {
      console.log(`[손님 현황] ${logicalToday} 날짜에 해당하는 데이터 없음`);
      return;
    }

    // 기존 오늘 메시지 삭제
    const msgs = await channel.messages.fetch({ limit: 50 }).catch(() => null);
    if (msgs && msgs.size > 0) {
      const targetMsgs  = msgs.filter((m) =>
        m.embeds.some((e) => {
          const t = e.title || '';
          const d = e.description || '';
          return t.includes(logicalToday) || d.includes(logicalToday);
        })
      );
      for (const m of targetMsgs.values()) {
        await m.delete().catch(() => {});
      }
    }

    // 새 embed 전송 (오늘만)
    await channel.send({ embeds: [targetEmbed] });

    console.log(`[손님 현황] ${guild.name} ${logicalToday} 현황 갱신 완료`);
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
