// utils/fetchPrice.js
const puppeteer = require('puppeteer');

// 품목별 itemId 매핑
const ITEM_IDS = {
  bok: '1132018',      // 복대
  hon: '2049100',      // 혼줌
  sijo: '666666797',   // 시조
  kkum: '5240153',     // 꿈조
  point: '666666661',  // 포인트
};

async function fetchPriceData(category = 'bok') {
  const itemId = ITEM_IDS[category];
  const url = `https://www.ronaoff.com/item/${itemId}`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();

  // 이미지/폰트/CSS 차단
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const block = ['image', 'font', 'stylesheet', 'media'];
    if (block.includes(req.resourceType())) {
      req.abort();
    } else req.continue();
  });

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // ---------------------------------------
  // ✔ 더보기 버튼 1회 클릭 (있으면)
  // ---------------------------------------
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')]
      .find((b) => b.textContent.trim() === '더보기');
    if (btn) btn.click();
  });

  // 더보기 클릭 후 DOM 로딩까지 대기
  await page.waitForTimeout(700);

  // ---------------------------------------
  // ✔ 데이터 파싱
  // ---------------------------------------
  const result = await page.evaluate(() => {
    const rows = document.querySelectorAll(
      'div.flex.items-center.gap-3.p-2'
    );

    return [...rows].map((row) => {
      const p = row.querySelectorAll('p');
      return {
        date: p[0]?.textContent.trim() || null,
        volume: p[1]?.textContent.trim() || null,
        price: p[2]?.textContent.trim() || null,
      };
    });
  });

  await browser.close();

  // 유효 항목만 필터링
  const filtered = result.filter(
    (d) => d.date && d.volume && d.price
  );

  return filtered;
}

module.exports = { fetchPriceData };
