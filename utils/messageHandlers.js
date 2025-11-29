const channelConfigMap = require('../config');

// prefix 명령어는 더 이상 지원하지 않음
module.exports.messageHandlers = async (message, client) => {
  if (message.author.bot) return false;
  if (!message.guild) return false;

  const content = message.content.trim(); 

  // 예전 "!정보" 처리 방지
  if (content.startsWith('!')) {
    const warning = await message.reply({
      content: `🚫 이제 **슬래시('/무영') 명령어와 버튼**만 사용할 수 있어요!`,
    });
    setTimeout(() => warning.delete().catch(() => {}), 5000);

    // 유저 메시지도 삭제 (선택)
    if (message.deletable) message.delete().catch(() => {});
    return true;
  }

  // prefix 명령어는 완전히 비활성화했으므로 더 이상 처리할 것 없음
  return false;
};
