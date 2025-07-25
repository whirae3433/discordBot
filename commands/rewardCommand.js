const { sheets } = require('../config/googleAuth');
const parseRewardArgs = require('../utils/parseRewardArgs');
const channelConfigMap = require('../config');
const { wrapMessage } = require('../utils/format');

module.exports.rewardCommand = async function (message) {
  console.log('채널 ID:', message.channel.id);

  if (!message.content.startsWith('!')) return false;

  const args = message.content.slice(1).trim().split(/\s+/);

  if (!args.includes('분배금')) return false;

  const parsed = parseRewardArgs(args);

  if (parsed.error) {
    await message.reply(parsed.error);
    return true;
  }

  const { name, week } = parsed;
  const range = `${week}주차!B20:C25`;

  const channelId = message.channel.id;
  const config = channelConfigMap[channelId];
  const spreadsheetId = config?.spreadsheetId;

  if (!spreadsheetId) {
    message.reply(`준비되면 말 걸어`);
    return true;
  }

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      message.reply('데이터를 찾을 수 없어...');
      return true;
    }

    const targetRow = rows.find((row) => row[0] === name);
    if (!targetRow) {
      message.reply(`${name}? 그게 뭔데?`);
      return true;
    }

    const wageValue = targetRow[1];
    if (!wageValue) {
      message.reply(`${name}의 ${week}주차 분배금은 빵원이야`);
      return true;
    }

    message.reply(
      wrapMessage(
        `어디보자... \n${name}의 ${week}주차 분배금은 \`${wageValue}\` 메소야!`
      )
    );
    return true;
  } catch (error) {
    console.error(error);
    message.reply('띠용 -_- 에러 발생!');
    return true;
  }
};
