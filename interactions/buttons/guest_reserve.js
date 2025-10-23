const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db'); // DB 연결 추가

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  try {
    // 1️⃣ DB에서 현재 서버의 순위별 금액 불러오기
    const res = await pool.query(
      `SELECT rank, amount FROM amount_by_rank WHERE server_id = $1 ORDER BY rank`,
      [serverId]
    );

    // 2️⃣ rank별 금액 매핑 (없으면 0으로)
    const amountMap = { 1: 0, 2: 0, 3: 0 };
    res.rows.forEach((row) => {
      amountMap[row.rank] = row.amount;
    });

    // 3️⃣ 셀렉트 메뉴 구성
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('guest_reserve')
        .setPlaceholder('예약할 순위를 선택하세요')
        .addOptions([
          {
            label: `🥇 1순위 - ${amountMap[1].toLocaleString()} 메소`,
            value: 'rank1',
          },
          {
            label: `🥈 2순위 - ${amountMap[2].toLocaleString()} 메소`,
            value: 'rank2',
          },
          {
            label: `🥉 3순위 - ${amountMap[3].toLocaleString()} 메소`,
            value: 'rank3',
          },
        ])
    );

    // 4️⃣ 메시지 전송 (ephemeral)
    await interaction.reply({
      content: '📝 예약할 순위를 선택해주세요.',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });

    // 5️⃣ 5초 뒤 메시지 삭제
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err) {
        console.error('메시지 삭제 실패:', err);
      }
    }, 5000);
  } catch (err) {
    console.error('[guest_reserve 버튼 오류]', err);
    await interaction.reply({
      content: '❌ 금액 정보를 불러오는 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });

    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err2) {
        console.error('[에러 메시지 삭제 실패]', err2);
      }
    }, 5000);
  }
};
