const path = require('path');
const schedule = require('node-schedule');
const channelConfigMap = require('../config');

module.exports.scheduleDailyMessage = (client) => {
  for (const [channelId, config] of Object.entries(channelConfigMap)) {
    const scheduleConfig = config.schedule;
    if (!scheduleConfig) continue;

    const { cron, messageFile } = scheduleConfig;
    const folderName = config.folderName;
    let messageText;

    try {
      // require 캐시 삭제 (항상 최신 메시지 반영되도록)
      const resolvedPath = path.resolve(
        __dirname,
        `../discordChannel/${folderName}/${messageFile}`
      );
      delete require.cache[resolvedPath];
      messageText = require(resolvedPath);
    } catch (err) {
      console.error(`❌ 스케줄 실패 (${messageFile}):`, err);
      continue;
    }

    schedule.scheduleJob({ rule: cron, tz: 'Asia/Seoul' }, async () => {
      {
        try {
          const channel = await client.channels.fetch(channelId);
          if (channel && channel.isTextBased()) {
            channel.send(`@everyone\n${messageText}`);
          }
        } catch (error) {
          console.error(`채널 ID ${channelId} 메시지 전송 실패:`, error);
        }
      }
    });
  }
};
