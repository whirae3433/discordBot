const { commands } = require('../commands'); // 공용 커맨드
const { adminCommands } = require('../commands/admin'); // 관리자 커맨드
const { isAdmin } = require('../utils/permissions');
const channelConfigMap = require('../config');

module.exports.messageHandlers = async (message, client) => {
  // 봇 메시지는 무시
  if (message.author.bot) return false;
  if (!message.guild) return false; // DM은 무시 (원하면 제거)

  const serverId = message.guild.id;
  const channelId = message.channel.id;

  const cfg = channelConfigMap[serverId];
  const [commandName, ...args] = message.content.trim().split(/\s+/);

  if (cfg?.restrictedChannel === channelId) {
    const isAllowedCommand = commandName === '!무영봇설정';
    if (!isAllowedCommand) {
      try {
        await message.delete();
        const warning = await message.channel.send({
          content: `🚫 이 채널에서는 버튼으로 소통해주세요.`,
        });
        setTimeout(() => {
          warning.delete().catch(() => {});
        }, 3000);
      } catch (err) {
        console.error('[제한 채널 삭제 오류]', err);
      }
      return true; // 이후 로직 중단
    }
  }

  // 1) 관리자 명령어 먼저 체크
  if (adminCommands?.has?.(commandName)) {
    if (!isAdmin(serverId, message.author.id)) {
      await message.reply('❌ 권한이 없습니다.');
      return true;
    }
    const runAdmin = adminCommands.get(commandName);
    await runAdmin(message, args, serverId, client);
    return true;
  }

  // 2) 공용 명령어 (배열 or Map 둘 다 대응)
  const command =
    (typeof commands.get === 'function' ? commands.get(commandName) : null) ||
    (Array.isArray(commands)
      ? commands.find((c) => c.name === commandName)
      : null);

  if (command) {
    try {
      console.log('[DEBUG] args:', args);

      await command.execute(message, args, client);
      return true;
    } catch (err) {
      console.error(`명령어 실행 오류 (${commandName}):`, err);
      message.reply('❌ 명령어 실행 중 오류가 발생했습니다.');
      return true;
    }
  }

  return false; // 해당 명령어 없음
};
