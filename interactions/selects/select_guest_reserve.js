const { buildGuestModal } = require('../modals/guestModalBuilder');

const labelMap = {
  rank1: '🥇 1순위',
  rank2: '🥈 2순위',
  rank3: '🥉 3순위',
};

module.exports = async (interaction) => {
  await interaction.message.delete().catch(() => {});
  
  const rankValue = interaction.values[0];
  const rankLabel = labelMap[rankValue];

  const modal = buildGuestModal('add', {
    modalId: `guest_add_${rankValue}`,
    title: `${rankLabel} 손님 예약`,
  });

  return interaction.showModal(modal);
};
