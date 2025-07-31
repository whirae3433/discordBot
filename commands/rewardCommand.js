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
    const range = `복대!AT5:AW87`; // 스프레드시트 범위

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
      const matchedRows = rows.filter((row) => row[0] === name);
      if (matchedRows.length === 0) {
        return message.reply(`${name}? 그런 이름은 없는데요?`);
      }

      // 금액 합산 (row[1]을 숫자로 변환 후 합산)
      const totalAmount = matchedRows.reduce((sum, row) => {
        const rawValue = row[1] || '0';
        const status = row[3] || ''; // 상태 (분배완료 여부)
        const numericValue = parseInt(rawValue.replace(/,/g, ''), 10) || 0;
        // 상태가 '분배완료'면 0으로 처리
        const effectiveValue = status.trim() !== '' ? 0 : numericValue;

        return sum + effectiveValue;
      }, 0);

      const formattedTotal = totalAmount.toLocaleString('ko-KR');

      return message.reply(
        wrapMessage(
          `어디보자...\n${name}의 분배금은 \`${formattedTotal}\` 메소입니다!`
        )
      );
    } catch (error) {
      console.error(error);
      return message.reply('에러 발생! 잠시 후 다시 시도해주세요.');
    }
  },
};
