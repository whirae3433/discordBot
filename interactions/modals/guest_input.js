module.exports = async (interaction) => {
  const rank = interaction.customId.replace('guest_input_', ''); // rank1 / rank2 / rank3
  const guestId = interaction.fields.getTextInputValue('guest_id');

  await interaction.reply({
    content: `✅ ${rank} 예약으로 손님 **${guestId}** 를 임시 등록했습니다. (DB 저장은 아직 X)`,
    ephemeral: true,
  });
};
