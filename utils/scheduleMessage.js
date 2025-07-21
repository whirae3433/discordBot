const schedule = require('node-schedule');
const partyMessage = require('../message');

const CHANNEL_ID = '1392654036620148937';

module.exports.scheduleDailyMessage = (client) => {
  schedule.scheduleJob('10 23 * * 1-5', async () => {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
      channel.send(`@everyone\n${partyMessage}`);
    }
  });
};
