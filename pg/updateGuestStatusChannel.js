const { buildGuestStatusEmbed } = require('../utils/buildGuestStatusEmbed');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const pool = require('../pg/db');

async function updateGuestStatusChannel(client, serverId, targetDate) {
  try {
    // 항상 한국 시간 기준
    const nowKST = dayjs().tz('Asia/Seoul');
    const today = nowKST.format('YYYY-MM-DD');

    // targetDate가 오늘이 아닐 경우 (서버-스케줄러 오차 방지)
    if (targetDate && targetDate !== today) {
      console.log(
        `[손님 현황] ${targetDate}는 오늘(${today})이 아니므로 갱신 생략`
      );
      return;
    }

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

    // ✅ Embed 생성 (모든 날짜)
    const embeds = await buildGuestStatusEmbed({ guild }, serverId);

    // ✅ 오늘 날짜 embed만 추출
    const todayEmbed = embeds.find((e) => e.data.title?.includes(today));
    if (!todayEmbed) {
      console.log(`[손님 현황] ${today} 날짜에 해당하는 데이터 없음`);
      return;
    }

    // 기존 오늘 날짜 메시지 삭제
    const msgs = await channel.messages.fetch({ limit: 50 }).catch(() => null);
    if (msgs && msgs.size > 0) {
      const todayMsgs = msgs.filter((m) =>
        m.embeds.some((e) => e.title?.includes(today))
      );
      for (const m of todayMsgs.values()) {
        await m.delete().catch(() => {});
      }
    }

    // 새 embed 전송
    await channel.send({ embeds: [todayEmbed] });

    console.log(`[손님 현황] ${guild.name} ${today} 현황 갱신 완료`);
  } catch (err) {
    console.error('[손님 현황 갱신 오류]', err);
  }
}

module.exports = { updateGuestStatusChannel };
