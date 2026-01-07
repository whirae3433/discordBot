const { loadCache, saveCache } = require('./cacheUtil');
const { fetchPriceData } = require('./fetchPrice');

const SIX_HOURS = 6 * 60 * 60 * 1000;

// itemId → 상태 객체
const states = new Map();

/**
 * 핵심 함수
 * - 캐시 유효 → 즉시 반환
 * - 캐시 없음 + 실행 중 → 같은 promise 반환
 * - 캐시 없음 + 실행 중 아님 → 새 promise 생성
 */

function fetchPriceDataCached(itemId) {
  const now = Date.now();
  const file = `rona_${itemId}.json`;

  let state = states.get(itemId);

  // 캐시 로드
  const cached = loadCache(file, SIX_HOURS);
  if (cached) {
    states.set(itemId, {
      data: cached,
      updatedAt: now,
    });
    return Promise.resolve(cached);
  }

  // 이미 실행 중인 promise가 있으면 공유
  if (state?.promise) {
    return state.promise;
  }

  // 새 promise 생성
  const promise = (async () => {
    try {
      const fresh = await fetchPriceData(itemId);
      saveCache(file, fresh);

      states.set(itemId, {
        data: fresh,
        updatedAt: Date.now(),
      });

      return fresh;
    } finally {
      // promise는 끝났으니 제거
      const s = states.get(itemId);
      if (s) delete s.promise;
    }
  })();

  states.set(itemId, { promise });
  return promise;
}

module.exports = { fetchPriceDataCached };
