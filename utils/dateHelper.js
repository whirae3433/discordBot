// 등록일 차이 계산 (ex: 2일 전 / now / ⚠️30일 전)
function getDaysAgo(regDate) {
  if (!regDate) return { text: '미기록', color: 0x00ae86 };

  const registeredDate = new Date(regDate);
  const today = new Date();

  // 시분초 제거 (자정으로 맞춤)
  registeredDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - registeredDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return { text: 'now', color: 0x00ae86 };
  if (diffDays >= 30) return { text: `⚠️ ${diffDays}일 전`, color: 0xff0000 };

  return { text: `${diffDays}일 전`, color: 0x00ae86 };
}

module.exports = { getDaysAgo };
