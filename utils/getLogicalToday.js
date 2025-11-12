const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * KST 기준 '논리적 오늘' 계산
 * - 자정 이후 cutoffMinutes 이내면 전날을 '오늘'로 간주
 * @param {number} [cutoffMinutes=60]  자정 이후 몇 분까지 전날로 간주할지 (기본 2시간)
 * @returns {string} 'YYYY-MM-DD' 형식의 문자열
 */
function getLogicalToday(cutoffMinutes = 90) {
  const now = dayjs().tz('Asia/Seoul');
  const minutes = now.hour() * 60 + now.minute();
  const logical = minutes < cutoffMinutes ? now.subtract(1, 'day') : now;
  return logical.format('YYYY-MM-DD');
}

module.exports = { getLogicalToday };
