const dayjs = require('dayjs');
require('dayjs/locale/ko');
dayjs.locale('ko');

const { EmbedBuilder } = require('discord.js');

const pool = require('../pg/db');
const { getLogicalToday } = require('./getLogicalToday');

// 고정 담당자 ID
const IKEA_ID = '1211483619613220886';

// ---------------- 공통 유틸 (유지) ---------------- //

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

function strikeToken(rank, reservedRanks) {
  return reservedRanks.includes(rank) ? '~~' : '';
}

// ---------------- 템플릿 치환 ---------------- //
// DB contents 에서는 {{dateText}} 처럼 작성하면 됨.
function applyTemplate(template, vars) {
  return String(template || '').replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = vars[key];
    return v === undefined || v === null ? '' : String(v);
  });
}

// ---------------- fallback: 안내 임베드 ---------------- //

async function buildFallbackEmbedPayload(client) {
  let avatarUrl = null;

  try {
    const user = await client.users.fetch(IKEA_ID);
    avatarUrl = user.displayAvatarURL({
      size: 256,
      forceStatic: true,
    });
  } catch (e) {
    // fetch 실패해도 그냥 썸네일 없이 진행
  }

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('무영봇 제작자 이케아 입니다')
    .setDescription(
      '구인글 양식 및 관련 문의는\n' + `아래 **'이케아'로 DM** 부탁드립니다.`,
    )
    .addFields({
      name: '👉 문의하기',
      value: `<@${IKEA_ID}>`,
      inline: true,
    })
    .setFooter({ text: 'DM이 차단되어 있다면 친구 추가 후 문의해주세요.' });

  if (avatarUrl) {
    embed.setThumbnail(avatarUrl);
  }

  return { embeds: [embed] };
}

// ---------------- Main ---------------- //

async function buildRecruitMessage(client, serverId) {
  // 1) recruit 채널 확인 (없으면 null)
  const res = await pool.query(
    `
    SELECT server_id, channel_id
    FROM bot_channels
    WHERE type = 'recruit' AND server_id = $1
    `,
    [serverId],
  );

  if (res.rowCount === 0) return null;

  const row = res.rows[0];

  // 2) 날짜 계산 (유지)
  const logicalTodayKey = getLogicalToday(2 * 60); // YYYY-MM-DD
  const logicalDay = dayjs(logicalTodayKey);

  const dateText = logicalDay.format('MM월 DD일  (ddd)');
  const dateKey = logicalDay.format('YYYY-MM-DD');

  // 3) 금액 조회
  const amountRes = await pool.query(
    `
    SELECT rank, amount
    FROM amount_by_rank
    WHERE server_id = $1
    ORDER BY rank ASC
    `,
    [row.server_id],
  );

  const rankMap = {};
  amountRes.rows.forEach((r) => {
    rankMap[r.rank] = formatToEokCheon(Number(r.amount));
  });

  // 4) 예약된 순위 조회
  const guestRes = await pool.query(
    `
    SELECT rank
    FROM guest_list
    WHERE server_id = $1 AND date = $2
    `,
    [row.server_id, dateKey],
  );
  const reservedRanks = guestRes.rows.map((r) => Number(r.rank));

  // 5) DB에서 recruit.contents 가져오기 (없으면 null)
  const templateRes = await pool.query(
    `SELECT contents FROM recruit WHERE server_id = $1`,
    [row.server_id],
  );

  const raw =
    templateRes.rowCount > 0 ? String(templateRes.rows[0].contents || '') : '';

  // DB에 내용이 없거나 공백이면: “담당자 안내 임베드”로 보여주기
  if (!raw.trim()) {
    return await buildFallbackEmbedPayload(client);
  }

  // 6) 치환 변수 준비 (여기 값들을 구인글 작성 시 가져다 쓰는거)
  const vars = {
    // 날짜
    dateText, // MM월 DD일  (ddd)
    dateKey, // YYYY-MM-DD

    // 금액(문자열)
    rank1: rankMap[1] || '?억',
    rank2: rankMap[2] || '?억',
    rank3: rankMap[3] || '?억',

    // 아이콘
    icon1: iconForRank(1, reservedRanks),
    icon2: iconForRank(2, reservedRanks),
    icon3: iconForRank(3, reservedRanks),

    // 취소선 토큰
    s1: strikeToken(1, reservedRanks),
    s2: strikeToken(2, reservedRanks),
    s3: strikeToken(3, reservedRanks),
  };

  const content = applyTemplate(raw, vars);

  // 텍스트 구인글 모드 (컴포넌트/임베드 없음)
  return { content, components: [] };
}

module.exports = { buildRecruitMessage };
