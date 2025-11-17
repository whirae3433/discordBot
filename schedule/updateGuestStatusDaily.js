const schedule = require('node-schedule');
const { updateGuestStatusChannel } = require('../pg/updateGuestStatusChannel');
const pool = require('../pg/db');

module.exports = function startGuestStatusScheduler(client) {
  // 한국시간 새벽 2시 기준으로 실행되게 설정
  const rule = new schedule.RecurrenceRule();
  rule.tz = 'Asia/Seoul';
  rule.hour = 2;
  rule.minute = 0;

  schedule.scheduleJob(rule, async () => {
    try {
      // 등록된 서버 목록 가져오기
      const res = await pool.query(
        `
        SELECT DISTINCT server_id 
        FROM bot_channels 
        WHERE type = 'guest_status'
        `
      );

      for (const row of res.rows) {
        const serverId = row.server_id;
        await updateGuestStatusChannel(client, serverId);
      }

      console.log(`[스케줄러] 손님 현황 자동 갱신 완료`);
    } catch (err) {
      console.error('[스케줄러 오류]', err);
    }
  });
};
