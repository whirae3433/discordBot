const schedule = require('node-schedule');
const pool = require('../pg/db');
const updateRecruitMessage = require('../pg/updateRecruitMessage');

module.exports = function startRecruitScheduler(client) {
  const rule = new schedule.RecurrenceRule();
  rule.tz = 'Asia/Seoul';
  rule.hour = 3;
  rule.minute = 0;

  schedule.scheduleJob(rule, async () => {
    try {
      const res = await pool.query(`
        SELECT DISTINCT server_id
        FROM bot_channels
        WHERE type = 'recruit'
      `);

      for (const row of res.rows) {
        await updateRecruitMessage(client, row.server_id);
      }
    } catch (err) {
      console.error('[자동 구인글 오류]', err);
    }
  });

  // 봇 시작 시 즉시 1회 실행 (테스트용)
  (async () => {
    console.log('[자동 구인글] ★ 테스트용 즉시 1회 실행');
    try {
      const res = await pool.query(`
        SELECT DISTINCT server_id
        FROM bot_channels
        WHERE type = 'recruit'
      `);

      for (const row of res.rows) {
        await updateRecruitMessage(client, row.server_id);
      }
    } catch (err) {
      console.error('[자동 구인글 오류]', err);
    }
  })();
};
