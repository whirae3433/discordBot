const puppeteer = require('puppeteer');

async function fetchPriceData(itemId) {
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

  // 이미지, 폰트, CSS, 미디어 차단
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // 페이지 로드
  await page.goto(url, { waitUntil: 'networkidle2' });

  // "더보기" 버튼 클릭
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent.includes('더보기')
    );
    if (btn) btn.click();
  });

  // 300ms 로딩 대기
  await page.waitForFunction(() => true, { timeout: 300 });

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
