const { sheets } = require('../../config/googleAuth');
const SPREADSHEET_ID = process.env.SCHEDULE_SHEET; // .env

// cron 정규식 : "분 시 * * 요일"
const cronRegex =
  /^(\*|[0-5]?\d)\s+(\*|[01]?\d|2[0-3])\s+\*\s+\*\s+([1-7](?:-[1-7])?(?:,[1-7])?|\*)$/;

module.exports = {
  name: '!스케줄수정',
  execute: async (message, args, channelId) => {
    if (args.length < 2) {
      return message.reply(
        '형식: `!스케줄수정 메시지 [내용]` 또는 `!스케줄수정 시간 [cron식]\n[cron식] : [분 시간 * * 1-7] 요일은 월요일: 1 부터 일요일: 7`'
      );
    }

    const type = args[0]; // 메시지 or 시간
    const newValue = args.slice(1).join(' ');

    if (type !== '메시지' && type !== '시간') {
      return message.reply('첫 번째 인자는 `메시지` 또는 `시간`이어야 합니다.');
    }

    // 시간 (cron) 유효성 검사
    if (type === '시간' && !cronRegex.test(newValue)) {
      return message.reply(
        '❌ 유효하지 않은 cron 형식입니다. 예: `10 23 * * 1-5`'
      );
    }

    try {
      // 현재 시트 데이터 불러오기
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Schedules!A:C',
      });

      const rows = res.data.values || [];
      const targetRowIndex = rows.findIndex((row) => row[0] === channelId);

      // 수정할 열 결정 (메시지 = B, 시간 = C)
      const columnLetter = type === '메시지' ? 'B' : 'C';

      if (targetRowIndex !== -1) {
        // 기존 행 업데이트
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Schedules!${columnLetter}${targetRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: { values: [[newValue]] },
        });
      } else {
        // 새 행 추가 (없는 경우) — 시간 또는 메시지만 들어갈 수 있음
        const messageValue = type === '메시지' ? newValue : '';
        const cronValue = type === '시간' ? newValue : '';

        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Schedules!A:C',
          valueInputOption: 'RAW',
          resource: { values: [[channelId, messageValue, cronValue]] },
        });
      }

      await message.reply(`✅ 스케줄 ${type}이(가) 수정되었습니다.`);
    } catch (err) {
      console.error('Google Sheets update error:', err);
      message.reply('❌ 스케줄 저장 중 오류가 발생했습니다.');
    }
  },
};
