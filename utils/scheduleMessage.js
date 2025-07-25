const schedule = require('node-schedule');
const { sheets } = require('../config/googleAuth');
const SPREADSHEET_ID = process.env.SCHEDULE_SHEET;

module.exports.scheduleDailyMessage = async () => {
  const client = global.botCLient; // 전역 client 참조

  try {
    // 구글 시트에서 데이터 가져오기
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Schedules!A:C', // A: channelId, B: message, C: cron
    });

    const rows = res.data.values || [];

    // 시트에 있는 각 행마다 스케줄 등록
    rows.forEach(([channelId, messageText, cronExp]) => {
      if (!channelId || !messageText || !cronExp) return;

      schedule.scheduleJob({ rule: cronExp, tz: 'Asia/Seoul' }, async () => {
        const client = global.botClient; // 여기서 매번 불러옴

        if (!client) {
          console.error('❌ global.botClient가 정의되지 않았습니다.');
          return;
        }

        try {
          const channel =
            client.channels.cache.get(channelId) ||
            (await client.channels.fetch(channelId).catch(() => null));

          if (channel && channel.isTextBased()) {
            channel.send(messageText);
          }
        } catch (error) {
          console.error(`채널 ID ${channelId} 메시지 전송 실패:`, error);
        }
      });
    });

    console.log(`✅ ${rows.length}개의 스케줄이 등록되었습니다.`);
  } catch (err) {
    console.error('❌ Google Sheets에서 스케줄 로드 실패:', err);
  }
};
