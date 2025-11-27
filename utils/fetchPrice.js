// utils/fetchPrice.js
const puppeteer = require('puppeteer');

// 품목별 itemId 매핑
const ITEM_IDS = {
  bok: '1132018', // 복대
  hon: '2049100', // 혼줌
  sijo: '666666797', // 시조
  kkum: '5240153', // 꿈조
  point: '666666661', // 포인트
};

async function fetchPriceData(category = 'bok') {
  const itemId = ITEM_IDS[category];
  const url = `https://www.ronaoff.com/item/${itemId}`;

  // Puppeteer 실행 (리소스 최소화)
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();

  // 이미지, 폰트, CSS, 광고 차단
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
      req.abort();
    } else req.continue();
  });

  await page.goto(url, { waitUntil: 'networkidle2' });

  // "더보기" 버튼 반복 클릭
  let clicked = true;
  while (clicked) {
    clicked = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) =>
        b.textContent.includes('더보기')
      );

      if (!btn) return false;
      btn.click();
      return true;
    });

    if (clicked) {
      await page.waitForFunction(() => true, { timeout: 300 });
    }
  }

  // 데이터 파싱
  const result = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.flex.items-center.p-2')];
    return rows.map((row) => {
      const p = row.querySelectorAll('p');

      return {
        date: p[0]?.textContent.trim(),
        volume: p[1]?.textContent.trim(),
        price: p[2]?.textContent.trim(),
      };
    });
  });

  await browser.close();

  // 유효 데이터만 필터링
  return result.filter((d) => d.date && d.volume && d.price);
}

module.exports = { fetchPriceData };
