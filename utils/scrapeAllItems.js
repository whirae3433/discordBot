// utils/scrapeAllItems.js
const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE = 'https://www.ronaoff.com';

// 자동완성에 사용할 검색 문자들
const KEYWORDS = [
  ...'abcdefghijklmnopqrstuvwxyz',
  ...'0123456789',
  ...'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ',
  ...'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ',
];

// 요청 차단 (이미지/폰트/CSS)
const BLOCKED = ['image', 'media', 'stylesheet', 'font'];

// 랜덤 딜레이
const wait = (ms) =>
  new Promise((r) => setTimeout(r, ms + Math.random() * 300));

async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
}

async function safeEvaluate(page, fn, retries = 3) {
  while (retries--) {
    try {
      return await page.evaluate(fn);
    } catch (e) {
      if (!retries) throw e;
      await wait(300);
    }
  }
}

async function scrapeAutoComplete(browser) {
  const page = await browser.newPage();

  // 사람처럼 보이게 User-Agent 조작
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'
  );

  // 차단할 리소스
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (BLOCKED.includes(req.resourceType())) req.abort();
    else req.continue();
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });

  let results = {};

  for (const kw of KEYWORDS) {
    await wait(200);

    const searchInput = await page.$('input');
    if (!searchInput) {
      throw new Error('검색창 input을 찾을 수 없습니다.');
    }

    // 입력 초기화
    await searchInput.click({ clickCount: 3 });
    await searchInput.press('Backspace');

    // 검색어 입력
    await searchInput.type(kw, { delay: 50 });

    await wait(400);

    // 자동완성 목록 읽기
    const items = await safeEvaluate(page, () => {
      const list = Array.from(document.querySelectorAll("a[href*='/item/']"));
      return list.map((a) => ({
        name: a.innerText.trim(),
        href: a.getAttribute('href'),
      }));
    });

    items.forEach((it) => (results[it.name] = it.href));
  }

  console.log(`자동완성 수집 완료: ${Object.keys(results).length}건`);
  return results;
}

// 상세 페이지에서 ID를 확정
async function resolveItemId(browser, name, href) {
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (BLOCKED.includes(req.resourceType())) req.abort();
    else req.continue();
  });

  await page
    .goto(BASE + href, {
      waitUntil: 'domcontentloaded',
      timeout: 5000,
    })
    .catch(() => null);
    
  const itemId = await safeEvaluate(page, () => {
    const parts = window.location.pathname.split('/');
    return parts[2] || null;
  });

  await page.close();

  if (!itemId) return null;

  return {
    name,
    id: itemId,
    icon: `https://maplestory.io/api/kms/latest/item/${itemId}/icon`,
  };
}

async function run() {
  const browser = await launchBrowser();

  // Step 1: 자동완성 리스트 수집
  const autoList = await scrapeAutoComplete(browser);

  const entries = Object.entries(autoList);
  const result = [];
  const concurrency = 5; // 병렬 5개씩
  let index = 0;

  async function worker() {
    while (index < entries.length) {
      const [name, href] = entries[index++];
      await wait(100);

      const info = await resolveItemId(browser, name, href);
      if (info) result.push(info);

      console.log(`진행: ${index}/${entries.length}`);
    }
  }

  // 병렬 실행
  const workers = Array.from({ length: concurrency }, worker);
  await Promise.all(workers);

  await browser.close();

  // JSON 저장
  fs.writeFileSync(
    './items_full.json',
    JSON.stringify(result, null, 2),
    'utf-8'
  );

  console.log('🎉 전체 아이템 수집 완료!');
  console.log(`총 ${result.length}개 수집됨`);
}

run();
