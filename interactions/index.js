const { MessageFlags } = require('discord-api-types/v10');

const buttonHandlers = {
  member_list: require('./buttons/member_list'),
  easter_egg: require('./buttons/easter_egg'),
  guest_reserve: require('./buttons/guest_reserve'),
  guest_list: require('./buttons/guest_list'),
  set_amount: require('./buttons/set_amount'),
};

const selectHandlers = {
  guest_reserve: require('./selects/guest_reserve'),
};

const modalHandlers = {
  guest_input_rank1: require('./modals/guest_input'),
  guest_input_rank2: require('./modals/guest_input'),
  guest_input_rank3: require('./modals/guest_input'),
  modal_set_amount: require('./modals/modal_set_amount'),
};

module.exports = async (interaction) => {
  try {
    if (interaction.isButton()) {
      const handler = buttonHandlers[interaction.customId];
      if (handler) return handler(interaction);
    }

    if (interaction.isStringSelectMenu()) {
      const handler = selectHandlers[interaction.customId];
      if (handler) return handler(interaction);
    }

    if (interaction.isModalSubmit()) {
      const handler = modalHandlers[interaction.customId];
      if (handler) return handler(interaction);
    }
  } catch (err) {
    console.error('[인터랙션 오류]', err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ 알 수 없는 오류가 발생했습니다.',
        flags: MessageFlags.Ephemeral,
      });
      // 자동 삭제 (선택)
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (deleteErr) {
          console.error('[오류 메시지 삭제 실패]', deleteErr);
        }
      }, 5000);
    }
  }
};
