const { MessageFlags } = require('discord-api-types/v10');

const buttonHandlers = {
  member_list: require('./buttons/member_list'),
  button_guest_reserve: require('./buttons/button_guest_reserve'),
  button_guest_status: require('./buttons/button_guest_status'),
  set_amount: require('./buttons/set_amount'),
};

const selectHandlers = {
  select_guest_reserve: require('./selects/select_guest_reserve'),
  select_edit_guest: require('./selects/select_edit_guest'),
  select_delete_guest: require('./selects/select_delete_guest')
};

const modalHandlers = {
  guest_input_rank1: require('./modals/modal_guest_input'),
  guest_input_rank2: require('./modals/modal_guest_input'),
  guest_input_rank3: require('./modals/modal_guest_input'),
  modal_set_amount: require('./modals/modal_set_amount'),
  modal_edit_guest: require('./modals/modal_edit_guest'),
  modal_delete_guest: require('./modals/modal_delete_guest'),
};

module.exports = async (interaction) => {
  try {
    if (interaction.isButton()) {
      const handler = buttonHandlers[interaction.customId];
      if (handler) return handler(interaction);
    }

    if (interaction.isStringSelectMenu()) {
      // 파일 라우트 방식 (selectMenus 폴더)
      try {
        const handler = require(`./selects/${interaction.customId}.js`);
        return handler(interaction);
      } catch {}
      // 매핑 객체 방식 (selectHandlers)
      const handler = selectHandlers[interaction.customId];
      if (handler) return handler(interaction);
    }

    if (interaction.isModalSubmit()) {
      // baseId 추출 후 파일 라우트
      const baseId = interaction.customId.split('_').slice(0, 3).join('_');
      try {
        const handler = require(`./modals/${baseId}.js`);
        return handler(interaction);
      } catch {}
      // 매핑 객체 방식 (fallback)
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
