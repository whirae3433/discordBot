const fs = require('fs');
const path = require('path');
const channelConfigMap = require('../../config');

module.exports = {
  name: '!스케줄수정',
  execute: async (message, args, channelId) => {
    if (args.length === 0) {
      return message.reply('수정사항을 입력하세요');
    }

    const config = channelConfigMap[channelId];
    if (!config?.schedule?.messageFile) {
      return message.reply('❌ 이 채널은 스케줄 설정이 없습니다.');
    }

    const folderName = config.folderName;
    const messageFilePath = path.resolve(
      __dirname,
      `../../discordChannel/${folderName}/${config.schedule.messageFile}`
    );

    const newMessage = args.join(' ');

    fs.writeFileSync(
      messageFilePath,
      `const partyMessage = \`${newMessage}\`;\nmodule.exports = partyMessage;`
    );

    await message.reply('✅ 스케줄 메시지가 수정되었습니다. `!리로드` 후 적용됩니다.');
  }
};
