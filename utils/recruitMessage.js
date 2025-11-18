const dayjs = require('dayjs');
require('dayjs/locale/ko');
dayjs.locale('ko');
const pool = require('../pg/db');
const { getLogicalToday } = require('../utils/getLogicalToday');

function formatToUk(amount) {
  return (amount / 100000000).toFixed(1).replace(/\.0$/, '') + '억';
}

function iconForRank(rank, reservedRanks) {
  return reservedRanks.includes(rank) ? '✅' : '⭕';
}

async function buildRecruitMessage(client, serverId) {
  const res = await pool.query(
    `
    SELECT server_id, channel_id
    FROM bot_channels
    WHERE type = 'recruit' AND server_id = $1
    `,
    [serverId]
  );

  // 혹시 서버 설정이 잘못되어 0개일 때
  if (res.rowCount === 0) return null;

  const row = res.rows[0];

  const logicalTodayKey = getLogicalToday(2 * 60); // YYYY-MM-DD
  const logicalDay = dayjs(logicalTodayKey); // dayjs 객체로 변환

  const dateText = logicalDay.format('M월 D일 (ddd)');
  const dateKey = logicalDay.format('YYYY-MM-DD');

  // 금액 조회
  const amountRes = await pool.query(
    `
    SELECT rank, amount
    FROM amount_by_rank
    WHERE server_id = $1
    ORDER BY rank ASC
    `,
    [row.server_id]
  );

  const rankMap = {};
  amountRes.rows.forEach((r) => {
    rankMap[r.rank] = formatToUk(Number(r.amount));
  });

  // 예약된 순위 조회
  const guestRes = await pool.query(
    `
    SELECT rank
    FROM guest_list
    WHERE server_id = $1 AND date = $2
    `,
    [row.server_id, dateKey]
  );
  const reservedRanks = guestRes.rows.map((r) => Number(r.rank));

  // 메시지 문자열만 생성해서
  return `
# 로나월드 마지막 시간대 "최저가 " 카오스혼테일 먹자
\`\`\`
🗓️ ${dateText} 🕖 23시 55분 출발

⭕ 모집 중 |  ✅ 예약 완료

🥇 순위 ${rankMap[1] || '?억'} ${iconForRank(1, reservedRanks)}
🥈 순위 ${rankMap[2] || '?억'} ${iconForRank(2, reservedRanks)}
🥉 순위 ${rankMap[3] || '?억'} ${iconForRank(3, reservedRanks)}

💰 예약금1억

🍹 포션소모❌ 편하게 잠수 🆗 초행🆗 

⚠️ 서버팅경우 전액 환불 or 내일 다시 먹자⚠️

💌 DM주세요
\`\`\`
`;
}

module.exports = { buildRecruitMessage };
