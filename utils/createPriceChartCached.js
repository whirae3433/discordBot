// utils/createPriceChartCached.js
const { loadBinaryCache, saveBinaryCache } = require('./cacheUtil');
const { createPriceChart } = require('./priceChart');

const SIX_HOURS = 6 * 60 * 60 * 1000;

async function createPriceChartCached(data, label, category) {
  const file = `chart_${category}.png`;

  const cached = loadBinaryCache(file, SIX_HOURS);
  if (cached) return cached;

  const buffer = await createPriceChart(data, label);
  saveBinaryCache(file, buffer);

  return buffer;
}

module.exports = { createPriceChartCached };
