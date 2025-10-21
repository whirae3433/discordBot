const { MessageFlags } = require('discord-api-types/v10');

const labelMap = {
  rank1: '🥇 1순위',
  rank2: '🥈 2순위',
  rank3: '🥉 3순위',
};

module.exports = async (interaction) => {
  const rankValue = interaction.customId.replace('guest_input_', '');
  const rankLabel = labelMap[rankValue] ?? '알 수 없음';

  const guestId = interaction.fields.getTextInputValue('guest_id');
  const date = interaction.fields.getTextInputValue('guest_date');

  // ✅ 날짜 형식 검증 (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(date)) {
    // 날짜 형식이 올바르지 않음 → 경고 메시지
    return interaction.reply({
      content: '⚠️ 날짜 형식이 올바르지 않습니다. 예: 2025-09-30',
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.reply({
    content: `🗓️ 날짜: **${date}** \n${rankLabel} **[${guestId}]**님 예약완료.`,
    flags: MessageFlags.Ephemeral,
  });
};
