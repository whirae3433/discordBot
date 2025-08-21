const { getProfilesFromSheet } = require('./profileCache');
const { mapRow } = require('./profileMapper');

function trimRow(row = []) {
  return row.map((v) => (typeof v === 'string' ? v.trim() : v));
}

function isValidDiscordId(value) {
  const s = String(value || '').trim();
  // 17~19자리 숫자 (스노우플레이크)
  return /^[0-9]{17,19}$/.test(s);
}

async function getProfileObjects(serverId) {
  const rows = (await getProfilesFromSheet(serverId)) || [];

  return (
    rows
      .map(trimRow)
      // 1) 헤더/예시행 제거: discordId가 유효한 숫자열인 행만 남김
      .filter((r) => isValidDiscordId(r[0]))
      // 2) 최소 키 보장: IGN도 있으면 더 안전
      .filter((r) => r[4] && String(r[4]).trim().length > 0)
      // 3) 객체 매핑
      .map(mapRow)
  );
}

module.exports = { getProfileObjects };
