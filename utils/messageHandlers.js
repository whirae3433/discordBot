const { commands } = require('../commands');

module.exports.messageHandlers = async (message, client) => {
  // 봇 메시지는 무시
  if (message.author.bot) return false;

  const args = message.content.trim().split(/\s+/);
  const commandName = args.shift();

  // 명령어 찾기
  const command = commands.find(cmd => cmd.name === commandName);

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
