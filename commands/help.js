module.exports = {
  name: '!무영',
  description: '명령어 목록과 사용법을 보여줍니다.',
  execute: async (message) => {
    const helpMessage = `
잉? 도움이 필요해?
\`\`\`
**일반 명령어**
!정보 <닉네임> - 프로필 조회
!분배금 <닉네임> - 이번 주 분배금 조회
!복대 - 로나오프 복대 판매내역

**관리자 명령어**
!공지 <내용> - 공지 작성
!스케줄수정 메시지 <내용> - 스케줄 내용 수정
!스케줄수정 시간 <시간> - 스케줄 시간 수정
!유보금 - 관리자의 유보금
\`\`\`
`;

    try {
      await message.reply(helpMessage);
    } catch (error) {
      console.error('도움말 명령어 에러:', error);
      await message.reply('도움말을 불러오는 중 오류가 발생했습니다.');
    }

    return true;
  },
};
