const { MessageFlags } = require('discord-api-types/v10');
const { safeReply } = require('../utils/safeReply');

const autocompleteRona = require('./autocomplete/rona_autocomplete');
// const btn_profile_register = require('./buttons/btn_profile_register.js');
// const modal_confirm_profile_redirect = require('./modals/modal_confirm_profile_redirect.js');

const { isServerEnabled } = require('../utils/serverGate');

const slashCommands = new Map();
slashCommands.set('무영봇', require('../commands/slash/setupMuyeongBot.js'));
slashCommands.set('로나오프', require('../commands/slash/priceCommand.js'));
slashCommands.set('정보', require('../commands/slash/info.js'));
slashCommands.set(
  '무영봇권한',
  require('../commands/slash/muyeongPermission.js'),
);

const buttonHandlers = {
  member_list: require('./buttons/member_list'),
  button_guest_reserve: require('./buttons/button_guest_reserve'),
  button_guest_status: require('./buttons/button_guest_status'),
  button_channel_menu: require('./buttons/button_channel_menu'),
  button_create_guest_status_channel: require('./buttons/button_create_guest_status_channel'),
  button_create_profile_channel: require('./buttons/button_create_profile_channel'),
  button_create_recruit_channel: require('./buttons/button_create_recruit_channel'),
  set_amount: require('./buttons/set_amount'),
  button_incentive_set: require('./buttons/button_incentive_set'),
  button_profile_menu: require('./buttons/button_profile_menu'),
  btn_profile_search: require('./buttons/btn_profile_search'),
  btn_job_search: require('./buttons/btn_job_search'),
  btn_profile_register: require('./buttons/btn_profile_register.js'),
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
  modal_confirm_profile_redirect: require('./modals/modal_confirm_profile_redirect'),
};

// 서버 OFF여도 통과시킬 예외들. 운영자 토글 커맨드(/무영봇권한)
function isBypass(interaction) {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === '무영봇권한') return true; // 운영자 토글
  }
  return false;
}

// 서버 OFF일 때 공통 차단 응답
async function replyServerDisabled(interaction) {
  const msg =
    '⛔ 이 서버는 현재 **비활성화(OFF)** 되어 있어요.\n' +
    `승인이 필요하면 <@${process.env.OWNER_DISCORD_ID}> 에게 DM 주세요.`;
    
  return safeReply(
    interaction,
    { content: msg },
    { deleteAfter: 10000, ephemeral: true },
  );
}

module.exports = async (interaction) => {
  try {
    // 자동완성 처리
    if (interaction.isAutocomplete()) {
      if (interaction.commandName === '로나오프') {
        return autocompleteRona(interaction);
      }
      return;
    }

    //  여기서 전체 기능 게이트
    const guild = interaction.guild;
    if (guild && !isBypass(interaction)) {
      const enabled = await isServerEnabled(guild.id);
      if (!enabled) {
        return replyServerDisabled(interaction);
      }
    }

    //  슬래시 명령어 처리
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
