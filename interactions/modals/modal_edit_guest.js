const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');

module.exports = async (interaction) => {
  const prefix = 'modal_edit_guest_';
  const oldId = interaction.customId.startsWith(prefix)
    ? interaction.customId.slice(prefix.length)
    : interaction.customId;

  const serverId = interaction.guildId;
  const discordId = interaction.user.id;

  // ✅ 숫자 파싱 유틸
  const parseIntSafe = (v, def = 0) => {
    if (v === null || v === undefined) return def;
    const str = String(v).replace(/[,]/g, '').trim();
    const n = parseInt(str, 10);
    return Number.isFinite(n) ? n : def;
  };

  // ✅ 1️⃣ 모달 입력값 읽기
  const date = interaction.fields.getTextInputValue('date')?.trim();
  const rank = parseIntSafe(interaction.fields.getTextInputValue('rank'));
  const guestName = interaction.fields.getTextInputValue('guest_name')?.trim();
  const depositRaw = interaction.fields.getTextInputValue('deposit')?.trim();
  const discount = parseIntSafe(
    interaction.fields.getTextInputValue('discount')
  );

  // 새 ID / RAID_ID 생성
  const newId = `${date}_${rank}`;
  const newRaidId = `${date}_${discordId}`;

  try {
    // 2️⃣ 유효성 검사
    if (!date || isNaN(rank) || rank < 1 || rank > 3) {
      return interaction.reply({
        content: '❌ 날짜 형식 또는 순위 입력이 잘못되었습니다.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // 3️⃣ 기본가 가져오기
    const baseRes = await pool.query(
      `SELECT amount FROM amount_by_rank WHERE server_id = $1 AND rank = $2`,
      [serverId, rank]
    );
    if (baseRes.rowCount === 0) {
      return interaction.reply({
        content: '❌ 해당 순위의 기본 금액이 설정되어 있지 않습니다.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const basePrice = parseIntSafe(baseRes.rows[0].amount);
    const totalPrice = Math.max(basePrice - discount, 0);

    // 4️⃣ 예약금 처리
    let deposit;
    if (depositRaw === '완납') {
      deposit = totalPrice;
    } else if (depositRaw === '없음') {
      deposit = 0;
    } else if (depositRaw === '1억') {
      deposit = 100000000;
    } else {
      return interaction.reply({
        content: '❌ 예약금은 "완납", "없음", "1억" 중 하나만 입력 가능합니다.',
        flags: MessageFlags.Ephemeral,
      });
    }
    if (deposit > totalPrice) deposit = totalPrice;

    const balance = Math.max(totalPrice - deposit, 0);

    // 5️⃣ 중복 확인 (id 기준)
    const conflictCheck = await pool.query(
      `SELECT 1 FROM guest_list WHERE server_id = $1 AND id = $2 AND id != $3`,
      [serverId, newId, oldId]
    );
    if (conflictCheck.rowCount > 0) {
      return interaction.reply({
        content: `❌ ${date}의 ${rank}순위는 이미 예약되어 있습니다.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // 6️⃣ DB 업데이트
    const updateQuery = `
      UPDATE guest_list
      SET
        id = $1,
        raid_id = $2,
        guest_name = $3,
        rank = $4,
        discount = $5,   
        total_price = $6,
        deposit = $7,
        balance = $8
      WHERE server_id = $9 AND id = $10
      RETURNING guest_name, total_price, deposit, balance, id, raid_id, rank, discount;
    `;
    const values = [
      newId,
      newRaidId,
      guestName,
      rank,
      discount,
      totalPrice,
      deposit,
      balance,
      serverId,
      oldId,
    ];

    const res = await pool.query(updateQuery, values);
    if (res.rowCount === 0) {
      return interaction.reply({
        content: '❌ 수정 대상 손님을 찾을 수 없습니다.',
        flags: MessageFlags.Ephemeral,
      });
    }

    // 7️⃣ 성공 응답
    const g = res.rows[0];
    return interaction.reply({
      content: `✅ 예약 수정 완료!\n\n🗓️ **${g.raid_id.split('_')[0]}** (${
        g.rank
      }순위)\n👤 **${
        g.guest_name
      }**\n💰 총액: ${g.total_price.toLocaleString()} 메소\n💸 예약금: ${g.deposit.toLocaleString()} 메소\n💳 잔금: ${g.balance.toLocaleString()} 메소`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (err) {
    console.error('[예약 수정 오류]', err);
    if (!interaction.replied) {
      await interaction.reply({
        content: '❌ 수정 중 오류가 발생했습니다.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
};
