const { isAdmin } = require('../utils/permissions');
const fs = require('fs');
const path = require('path');

// admin 폴더 안의 명령어 파일 모두 로드
const adminCommands = new Map();

const files = fs
  .readdirSync(path.join(__dirname, 'admin'))
  .filter((f) => f.endsWith('.js'));
for (const file of files) {
  const command = require(`./admin/${file}`);
  adminCommands.set(command.name, command.execute);
}

module.exports.adminCommands = async function (message, client) {
  const channelId = message.channel.id;
  const userId = message.author.id;
  const [command, ...args] = message.content.split(' ');

  // 명령어 없으면 false → 다음 핸들러로
  if (!adminCommands.has(command)) return false;

  // 권한 확인
  if (!isAdmin(channelId, userId)) {
    await message.reply('❌ 권한이 없습니다.');
    return true;
  }

  // 해당 명령어 실행
  await adminCommands.get(command)(message, args, channelId);
  return true;
};
