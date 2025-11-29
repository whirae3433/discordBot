const { loadBinaryCache, saveBinaryCache } = require('./cacheUtil');
const { createPriceChart } = require('./priceChart');

const SIX_HOURS = 6 * 60 * 60 * 1000;

async function createPriceChartCached(data, itemName, itemId) {
  const file = `chart_${itemId}.png`;

  const cached = loadBinaryCache(file, SIX_HOURS);
  if (cached) return cached;

  const buffer = await createPriceChart(data, itemName);
  saveBinaryCache(file, buffer);

  return buffer;
}

module.exports = { createPriceChartCached };
