const { sheets } = require('../config/googleAuth');
const parseRewardArgs = require('../utils/parseRewardArgs');

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

module.exports.rewardCommand = async function (message) {
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

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      message.reply('데이터를 찾을 수 없어...');
      return true;
    }

    const targetRow = rows.find((row) => row[0] === name);
    if (!targetRow) {
      message.reply(`${name}가 뭔데?`);
      return true;
    }

    const wageValue = targetRow[1];
    if (!wageValue) {
      message.reply(`${name}의 ${week}주차 분배금은 빵원이야`);
      return true;
    }

    message.reply(
      `어디보자... \n${name}의 ${week}주차 분배금은: ${wageValue} 이야!`
    );
    return true;
  } catch (error) {
    console.error(error);
    message.reply('띠용 -_- 에러 발생!');
    return true;
  }
};
