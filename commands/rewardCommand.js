const { sheets } = require('../utils/googleSheets');
const channelConfigMap = require('../config');
const { wrapMessage } = require('../utils/format');
const parseArgs = require('../utils/parseArgs');

module.exports = {
  name: '!분배금',
  discription: '닉네임으로 분배금을 조회합니다.',
  execute: async (message, args) => {
    const parsed = parseArgs(args, { requireName: true });
    if (parsed.error) {
      return message.reply(parsed.error);
    }

    const { name } = parsed;
    const range = `복대!AT5:AU87`; // 스프레드시트 범위

    // 채널별 config 확인
    const serverId = message.guild.id; // 서버 ID
    const serverConfig = channelConfigMap[serverId];

    if (
      !serverConfig ||
      !serverConfig.allowedChannels.includes(message.channel.id)
    ) {
      return message.reply('❌ 이 채널은 아직 준비되지 않았습니다.');
    }

    const spreadsheetId = serverConfig.spreadsheetId;

    try {
      // Google Sheets에서 데이터 가져오기
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = res.data.values;
      if (!rows || rows.length === 0) {
        return message.reply('데이터를 찾을 수 없습니다.');
      }

      // 이름 매칭
      const targetRow = rows.find((row) => row[0] === name);
      if (!targetRow) {
        return message.reply(`${name}? 그런 이름은 없는데요?`);
      }

      const wageValue = targetRow[1] || 0;
      return message.reply(
        wrapMessage(
          `어디보자...\n${name}의 분배금은 \`${wageValue}\` 메소입니다!`
        )
      );
    } catch (error) {
      console.error(error);
      return message.reply('에러 발생! 잠시 후 다시 시도해주세요.');
    }
  },
};
