module.exports.helpCommand = async function helpCommand(message) {
  const helpMessage = `
잉? 도움이 필요해?
\`\`\`
**일반 명령어**
!<이름> (ex. !지노) - 사진
!<이름> 분배금 - 이번 주 분배금
!<이름> <몇>주차 분배금 
 (ex. !지노 2주차 분배금) - 2주차 분배금

!복대 - 로나오프 복대 판매내역

**관리자 명령어**
!공지 <내용> - 공지 작성
!스케줄수정 <내용> - 스케줄 수정
!리로드 - 변경내용 저장
!유보금 - 관리자의 유보금
\`\`\`
`;
  if (message.content === '!무영') {
    await message.reply(helpMessage);
    return true;
  }
  return false;
};
