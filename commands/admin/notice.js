module.exports = {
  name: '!공지',
  description: '채널에 공지를 게시합니다. (관리자 전용)',
  execute: async (message, args) => {
    try {
      // 1. 관리자 권한 체크
      if (!message.member.permissions.has('Administrator')) {
        return message.reply('❌ 이 명령어는 관리자만 사용할 수 있습니다.');
      }

      // 2. 인자 유효성 체크
      if (!args || args.length === 0) {
        return message.reply('공지할 메시지를 입력하세요.');
      }

      // 3. 공지 내용 합치기
      const noticeText = args.join(' ');

      // 4. 공지 발송
      await message.channel.send(`📢 ${noticeText}`);
    } catch (error) {
      console.error('공지 명령어 에러:', error);
      return message.reply('공지 전송 중 오류가 발생했습니다.');
    }

    return true;
  },
};
