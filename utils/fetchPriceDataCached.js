const { loadCache, saveCache } = require('./cacheUtil');
const { fetchPriceData } = require('./fetchPrice');

const SIX_HOURS = 6 * 60 * 60 * 1000;

async function fetchPriceDataCached(itemId) {
  const file = `rona_${itemId}.json`;

  const cached = loadCache(file, SIX_HOURS);
  if (cached) return cached;

  const fresh = await fetchPriceData(itemId);
  saveCache(file, fresh);

  return fresh;
}

module.exports = { fetchPriceDataCached };
