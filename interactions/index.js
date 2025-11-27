const { MessageFlags } = require('discord-api-types/v10');

const slashCommands = new Map();
slashCommands.set('무영봇', require('../commands/slash/setupMuyeongBot.js'));
slashCommands.set('로나오프', require('../commands/slash/priceCommand.js'));
slashCommands.set('정보', require('../commands/slash/info.js'));
slashCommands.set('분배금', require('../commands/slash/rewardCommand.js'));

const buttonHandlers = {
  member_list: require('./buttons/member_list'),
  button_guest_reserve: require('./buttons/button_guest_reserve'),
  button_guest_status: require('./buttons/button_guest_status'),
  button_channel_menu: require('./buttons/button_channel_menu'),
  button_create_guest_status_channel: require('./buttons/button_create_guest_status_channel'),
  button_create_profile_channel: require('./buttons/button_create_profile_channel'),
  set_amount: require('./buttons/set_amount'),
  button_incentive_set: require('./buttons/button_incentive_set'),
  button_profile_menu: require('./buttons/button_profile_menu'),
  btn_profile_search: require('./buttons/btn_profile_search'),
};

const selectHandlers = {
  select_guest_reserve: require('./selects/select_guest_reserve.js'),
  select_guest_edit: require('./selects/select_guest_edit'),
  select_guest_delete: require('./selects/select_guest_delete'),
  profile_select_job: require('./selects/profile_select_job'),
};

const modalHandlers = {
  guest_add_rank1: require('./modals/modal_guest_add'),
  guest_add_rank2: require('./modals/modal_guest_add'),
  guest_add_rank3: require('./modals/modal_guest_add'),
  modal_set_amount: require('./modals/modal_set_amount'),
  modal_guest_edit: require('./modals/modal_guest_edit'),
  modal_guest_delete: require('./modals/modal_guest_delete'),
  modal_incentive_add: require('./modals/modal_incentive_add.js'),
  modal_profile_search: require('./modals/modal_profile_search'),
};

module.exports = async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = slashCommands.get(interaction.commandName);
      if (cmd) return cmd.execute(interaction);
      return;
    }

    if (interaction.isButton()) {
      console.log('BUTTON PRESS:', interaction.customId);
      const id = interaction.customId;
      const handler = buttonHandlers[id];
      console.log('HANDLER FOUND:', handler ? 'YES' : 'NO');
      if (handler) return handler(interaction);

      if (id.startsWith('btn_incentive_edit_'))
        return require('./buttons/btn_incentive_edit')(interaction);

      if (id.startsWith('btn_incentive_delete_'))
        return require('./buttons/btn_incentive_delete')(interaction);
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
