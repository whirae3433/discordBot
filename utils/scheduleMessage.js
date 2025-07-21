const schedule = require('node-schedule');
const partyMessage1 = require('../message');
const partyMessage2 = require('../message2');

const CHANNEL_SCHEDULES = [
  {
    channelId: '1392654036620148937',
    cron: '10 23 * * 1-5',
    message: `@everyone\n${partyMessage1}`, // 문자열이면 OK
  },
  {
    channelId: '1395048230642778284',
    cron: '25 20 * * 1-5', // 오후 10시 25분으로 수정
    message: `@everyone\n${partyMessage2}`,
  },
];

module.exports.scheduleDailyMessage = (client) => {
  CHANNEL_SCHEDULES.forEach(({ channelId, cron, message }) => {
    schedule.scheduleJob(cron, async () => {
      try {
        const channel = await client.channels.fetch(channelId);
        if (channel && channel.isTextBased()) {
          channel.send(message);
        }
      } catch (error) {
        console.error(`채널 ID ${channelId} 메시지 전송 실패:`, error);
      }
    });
  });
};
