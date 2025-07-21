const getWeekOfMonth = require('./getWeekOfMonth');

function parseRewardArgs(args) {
  if (!args || args.length < 2) return { error: '명령어 형식이 잘못됐어요.' };

  const name = args[0];
  const hasBonusKeyword = args.includes('분배금');
  if (!name || !hasBonusKeyword) return { error: '분배금 키워드가 없어요.' };

  const weekArg = args.find((arg) => /\d+주차/.test(arg));
  const invalidWeekArg = args.find((arg) => /^\d+$/.test(arg)); // 숫자만 있는 경우

  if (invalidWeekArg) {
    return {
      error: `"${invalidWeekArg}"는 주차 형식이 아니야. "2주차"처럼 써줘!`,
    };
  }

  const week = weekArg ? parseInt(weekArg) : getWeekOfMonth();

  if (week < 1 || week > 5) {
    return { error: `${weekArg}은(는) 올바른 주차가 아니야! 다시 확인해봐` };
  }

  return { name, week };
}

module.exports = parseRewardArgs;
