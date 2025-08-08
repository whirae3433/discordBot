const { sheets } = require('./googleSheets');
const serverConfigs = require('../config/dataConfig');

const cache = new Map(); // { [serverId]: { timestamp, dataRows } }
const TTL = 1000 * 60 * 3; // 3분

async function getProfilesFromSheet(serverId) {
  const now = Date.now();

  const cached = cache.get(serverId);
  if (cached && now - cached.timestamp < TTL) {
    return cached.dataRows;
  }

  const config = serverConfigs[serverId];
  if (!config) return [];

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: '길드원!A:M',
    });

    const rows = res.data.values || [];
    const dataRows = rows.filter((row) => row.length > 0).slice(1); // 헤더 제외

    cache.set(serverId, { timestamp: now, dataRows });

    return dataRows;
  } catch (err) {
    console.error(`[ERROR] getProfilesFromSheet(${serverId}):`, err.message);
    return [];
  }
}

// 선택적으로 캐시 초기화도 지원 가능
function clearCache(serverId) {
  if (serverId) {
    cache.delete(serverId);
  } else {
    cache.clear();
  }
}

module.exports = { getProfilesFromSheet, clearCache };
