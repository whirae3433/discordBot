const channelConfigMap = require('../config');

module.exports.messageHandlers = async (message, client) => {
  if (message.author.bot) return false;
  if (!message.guild) return false; // DM은 무시 (원하면 제거)

  const serverId = message.guild.id;
  const channelId = message.channel.id;

  const cfg = channelConfigMap[serverId];
  const [commandName, ...args] = message.content.trim().split(/\s+/);

  // 제한 채널 처리
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

  const { commands } = require('../commands'); // ⬅️ 이제 admin 제거했으니 순환 위험 없음
  const command = commands.get(commandName);

  if (command) {
    try {
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
