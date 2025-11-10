const { sheets } = require('./googleSheets');
const serverConfigs = require('../config/dataConfig');
const { mapRow } = require('./profileMapper');

/** 문자열 트림 유틸 */
function trimRow(row = []) {
  return row.map((v) => (typeof v === 'string' ? v.trim() : v));
}

/** Discord ID 유효성 검사 (스노우플레이크 형식) */
function isValidDiscordId(value) {
  const s = String(value || '').trim();
  return /^[0-9]{17,19}$/.test(s);
}

/** ✅ 캐시 없이 직접 Google Sheets에서 데이터 읽기 */
async function getProfileObjects(serverId) {
  const config = serverConfigs[serverId];
  if (!config) {
    console.warn(`[WARN] serverConfigs에 ${serverId} 설정이 없습니다.`);
    return [];
  }

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: '길드원!A:O',
      valueRenderOption: 'UNFORMATTED_VALUE', // 숫자, 콤마, 포맷 그대로 유지
    });

    const rows = res.data.values || [];

    return rows
      .map(trimRow)
      // 1️⃣ 유효한 Discord ID만 남김 (헤더/빈행 제거)
      .filter((r) => isValidDiscordId(r[0]))
      // 2️⃣ IGN(인게임닉) 값이 있는 행만
      .filter((r) => r[4] && String(r[4]).trim().length > 0)
      // 3️⃣ 객체로 매핑
      .map(mapRow);
  } catch (err) {
    console.error(`[ERROR] getProfileObjects(${serverId}):`, err.message);
    return [];
  }
}

module.exports = { getProfileObjects };
