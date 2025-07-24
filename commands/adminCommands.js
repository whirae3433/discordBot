const { isAdmin } = require('../utils/permissions');
const channelConfigMap = require('../config');

module.exports.adminCommands = async function (message, client) {
  const channelId = message.channel.id;
  const userId = message.author.id;

  // --- 명령어 리스트 지정 (관리자 명령어만 체크) ---
  const adminCommandsList = ['!리로드', '!이케아 유보금', '!공지'];

  // 메시지가 관리자 명령어가 아니면 false 반환 → 다른 핸들러로 넘어감
  if (!adminCommandsList.some((cmd) => message.content.startsWith(cmd))) {
    return false;
  }

  // 관리자 아니면 flase 반환 -> specialCommands로 넘어감
  if (!isAdmin(channelId, userId)) {
    await message.reply('❌ 권한이 없습니다.');
    return true;
  }

  // console.log('[adminCommands] called', message.content);
  const [command, ...args] = message.content.split(' ');

  switch (command) {
    case '!리로드':
      delete require.cache[require.resolve('../config')];
      message.reply('✅ 설정 리로드 완료!');
      return true;

    case '!이케아':
      if (args[0] === '유보금') {
        await message.reply(
          '.💲환영합니다 이케아님.\n스위스 은행에 있는 유보금은 400억입니다.'
        );
        return true;
      }
      break;

    case '!공지':
      if (args.length === 0) {
        return message.reply('공지할 메시지를 입력하세요.');
      }

      const noticeText = args.join(' ');
      await message.channel.send(`📢 ${noticeText}`);
      return true;

    default:
      return false;
  }
};
