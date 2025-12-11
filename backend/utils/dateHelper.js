function gsheetsSerialToDate(n) {
  // 기준: 1899-12-30 (UTC)
  const base = Date.UTC(1899, 11, 30);
  return new Date(base + n * 86400000);
}

// 다양한 형태(regDate)가 들어와도 JS Date로 변환
function toSafeDate(input) {
  if (!input && input !== 0) return null;

  if (input instanceof Date) return isNaN(input) ? null : input;

  if (typeof input === 'number') {
    // 13자리면 ms 타임스탬프, 그 외 숫자는 시트 시리얼로 처리
    if (input >= 1e12) return new Date(input);
    return gsheetsSerialToDate(input);
  }

  if (typeof input === 'string') {
    const s = input.trim();

    // 13자리 숫자 문자열(ms)
    if (/^\d{13}$/.test(s)) return new Date(Number(s));

    // 시트 시리얼 형태(정수/소수)
    if (/^\d+(\.\d+)?$/.test(s)) return gsheetsSerialToDate(Number(s));

    // 흔한 날짜 구분자 보정
    const normalized = s.replace(/[./]/g, '-');
    const d = new Date(normalized);
    return isNaN(d) ? null : d;
  }

  return null;
}

// 등록일 차이 계산 (ex: 2일 전 / now / ⚠️30일 전)
function getDaysAgo(regDate) {
  const registeredDate = toSafeDate(regDate);
  if (!registeredDate) return { text: '미기록', color: 0x00ae86 };

  const today = new Date();

  // 자정 기준 비교
  registeredDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - registeredDate.getTime()) / 86400000
  );

  if (diffDays === 0) return { text: 'now', color: 0x00ae86 };
  if (diffDays >= 30) return { text: `⚠️ ${diffDays}일 전`, color: 0xff0000 };
  return { text: `${diffDays}일 전`, color: 0x00ae86 };
}

module.exports = { getDaysAgo };
