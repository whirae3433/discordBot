const channelConfigMap = require('../config');

module.exports.specialCommands = function (message) {
  const channelId = message.channel.id;
  const config = channelConfigMap[channelId];

  if (!config || !config.commands) return false;

  const commandConfig = config.commands[message.content];
  if (!commandConfig) return false;

  const { type, file, text } = commandConfig;

  if (type === 'image' && file) {
    console.log(`📸 Sending image: ${file}`);
    message.channel.send({ files: [file] });
  } else if (type === 'text' && text) {
    message.reply(text);
  } else {
    console.log('❌ 잘못된 commandConfig 구조');
  }

  return true;
};
