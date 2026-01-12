const dayjs = require('dayjs');
require('dayjs/locale/ko');
dayjs.locale('ko');
const pool = require('../pg/db');
const { getLogicalToday } = require('../utils/getLogicalToday');

function formatToEokCheon(amount) {
  const n = Number(amount) || 0;
  const eok = Math.floor(n / 100000000); // 억
  const cheon = Math.floor((n % 100000000) / 10000000); // 천(=천만 단위)

  if (eok > 0 && cheon > 0) return `${eok}억${cheon}천`;
  if (eok > 0) return `${eok}억`;
  if (cheon > 0) return `${cheon}천`;
  return '0';
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

  const dateText = logicalDay.format('MM월 DD일  (ddd)');
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
    rankMap[r.rank] = formatToEokCheon(Number(r.amount));
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
\`\`\`
🐲 카혼목 먹자 🐲

📆 ${dateText}
⏰ 금일 23:40 출발

✨ 격수 보공 M |  메 30파티 ✨
⭕ 예약 가능   |  ✅ 구인 완료 

1️⃣ 순위 ${rankMap[1] || '?억'} | [${iconForRank(1, reservedRanks)}]
2️⃣ 순위 ${rankMap[2] || '?억'} | [${iconForRank(2, reservedRanks)}]
3️⃣ 순위 ${rankMap[3] || '?억'} | [${iconForRank(3, reservedRanks)}]
  
📣 3 순위 미드랍시 수수료 포함 전액환불 📣            
🌈 초행인 분들도 친절하게 설명 드립니다 🌈
❤️ 서버팅 일 경우 환불 or 내일 재예약  ❤️

🕊️ DM 칼 답장 문의 주세요 🕊️
\`\`\`
`;
}

module.exports = { buildRecruitMessage };
