module.exports = {
  name: '!유보금',
  description: '현재 유보금을 조회합니다.',
  execute: async (message) => {
    try {
      // 유보금 조회 로직 (지금은 고정 값, 추후 데이터베이스 연동 가능)
      await message.reply(
        '환영합니다 이케아님.\n스위스 은행에 있는 유보금은 400억입니다.'
      );
    } catch (error) {
      console.error('유보금 조회 에러:', error);
      await message.reply('😥 유보금을 불러오는 데 실패했어...');
    }

    return true; // 명령어 처리됨
  },
};
