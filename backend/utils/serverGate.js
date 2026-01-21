const pool = require('../pg/db');

// 간단 TTL 캐시 (서버별 is_enabled)
const CACHE_TTL_MS = 60 * 1000; // 60초
const cache = new Map(); // serverId -> { enabled:boolean, exp:number }

async function isServerEnabled(serverId) {
  const now = Date.now();
  const hit = cache.get(serverId);
  if (hit && hit.exp > now) return hit.enabled;

  const res = await pool.query(
    `SELECT is_enabled FROM servers WHERE server_id = $1`,
    [serverId]
  );

  const enabled = res.rowCount > 0 && res.rows[0].is_enabled === true;
  cache.set(serverId, { enabled, exp: now + CACHE_TTL_MS });
  return enabled;
}

function invalidateServerEnabledCache(serverId) {
  cache.delete(serverId);
}

module.exports = {
  isServerEnabled,
  invalidateServerEnabledCache,
};
