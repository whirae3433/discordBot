const schedule = require('node-schedule');
const { scheduleDailyMessage } = require('../../utils/scheduleMessage');

module.exports = {
  name: '!리로드',
  execute: async (message) => {
    try {
      // 기존 스케줄 전부 취소
      await schedule.gracefulShutdown();

      // 스프레드시트에서 다시 로드
      await scheduleDailyMessage();

      message.reply('✅ 스케줄이 리로드되었습니다.');
    } catch (err) {
      console.error('리로드 오류:', err);
      message.reply('❌ 스케줄 리로드 중 오류가 발생했습니다.');
    }
  },
};
