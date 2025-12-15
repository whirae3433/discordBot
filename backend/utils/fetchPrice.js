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

  try {
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

    // 타임아웃 설정
    await page.setDefaultTimeout(15000);
    await page.setDefaultNavigationTimeout(15000);

    // 페이지 로드
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    // "더보기" 버튼 클릭
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) =>
        b.textContent.includes('더보기')
      );
      if (btn) btn.click();
    });

    // 300ms 대기
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

    return result.filter((d) => d.date && d.volume && d.price);
  } finally {
    // 무조건 실행됨 (에러 나도)
    await browser.close();
  }
}

module.exports = { fetchPriceData };
