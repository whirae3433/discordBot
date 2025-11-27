// utils/fetchPriceDataCached.js
const { loadCache, saveCache } = require('./cacheUtil');
const { fetchPriceData } = require('./fetchPrice');

const SIX_HOURS = 6 * 60 * 60 * 1000;

async function fetchPriceDataCached(category) {
  const file = `rona_${category}.json`;

  const cached = loadCache(file, SIX_HOURS);
  if (cached) return cached;

  const fresh = await fetchPriceData(category);
  saveCache(file, fresh);

  return fresh;
}

module.exports = { fetchPriceDataCached };
