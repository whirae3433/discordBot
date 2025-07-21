const axios = require('axios');
const cheerio = require('cheerio');

async function fetchPriceData(itemId = '1132018') {
  const url = `https://www.ronaoff.com/item/${itemId}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const result = [];

  $('.flex.items-center.p-2').each((_, el) => {
    const date = $(el).find('p').eq(0).text().trim();
    const volume = $(el).find('p').eq(1).text().trim();
    const price = $(el).find('p').eq(2).text().trim();

    if (date && volume && price) {
      result.push({ date, volume, price });
    }
  });

  return result;
}

module.exports = { fetchPriceData };
