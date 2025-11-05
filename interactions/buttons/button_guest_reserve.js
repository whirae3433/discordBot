const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
const pool = require('../../pg/db');
const { buildGuestStatusEmbed } = require('../../utils/buildGuestStatusEmbed');

module.exports = async (interaction) => {
  const serverId = interaction.guildId;

  try {
    // 손님 현황 Embed
    const embeds = await buildGuestStatusEmbed(interaction, serverId);

    // 순위별 금액 조회
    const res = await pool.query(
      `
      SELECT rank, amount 
      FROM amount_by_rank 
      WHERE server_id = $1 
      ORDER BY rank
      `,
      [serverId]
    );

    const amountMap = { 1: 0, 2: 0, 3: 0 };
    res.rows.forEach((row) => {
      amountMap[row.rank] = row.amount;
    });

    // 안전한 금액 포맷
    const format = (n) => (Number.isFinite(n) ? n.toLocaleString() : '0');

    // Select 메뉴
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_guest_reserve')
      .setPlaceholder('✏️ 예약할 순위를 선택하세요')
      .addOptions([
        {
          label: `🥇 1순위 - ${format(amountMap[1])} 메소`,
          value: 'rank1',
        },
        {
          label: `🥈 2순위 - ${format(amountMap[2])} 메소`,
          value: 'rank2',
        },
        {
          label: `🥉 3순위 - ${format(amountMap[3])} 메소`,
          value: 'rank3',
        },
      ]);

    const components = [new ActionRowBuilder().addComponents(selectMenu)];

    // 이 버튼 누른 사람만 보이게 ephemeral 응답
    const reply = await interaction.reply({
      embeds,
      components,
      flags: MessageFlags.Ephemeral,
    });

    // 5초 후 자동 삭제 (아무 선택도 안 하면)
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err) {
        // 이미 모달 열거나 선택한 경우엔 삭제 실패 무시
      }
    }, 5000);
  } catch (err) {
    console.error('[guest_reserve 버튼 오류]', err);

    await interaction.reply({
      content: '❌ 예약 정보를 불러오는 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral,
    });
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch {}
    }, 5000);
  }
};
