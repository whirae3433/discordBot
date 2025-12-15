const { loadCache, saveCache } = require('./cacheUtil');
const { fetchPriceData } = require('./fetchPrice');

const SIX_HOURS = 6 * 60 * 60 * 1000;

// itemId별 Puppeteer 실행 중 여부
const running = new Set();

function fetchPriceDataCached(itemId) {
  const file = `rona_${itemId}.json`;

  const cached = loadCache(file, SIX_HOURS);
  if (cached) {
    return { data: cached };
  }

  triggerBackgroundRefresh(itemId, file);
  return { data: null };
}

async function triggerBackgroundRefresh(itemId, file) {
  if (running.has(itemId)) return;

  running.add(itemId);
  try {
    const fresh = await fetchPriceData(itemId);
    saveCache(file, fresh);
  } catch (err) {
    console.error('[ronaoff] refresh failed', {
      itemId,
      message: err?.message,
    });
  } finally {
    running.delete(itemId);
  }
}

module.exports = { fetchPriceDataCached };
