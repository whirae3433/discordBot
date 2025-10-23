const path = require('path');
const { AttachmentBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');

module.exports = async (interaction) => {
  try {
    const imagePath = path.join(__dirname, '../../public/이스터에그.jpeg');
    const imageAttachment = new AttachmentBuilder(imagePath);

    // ✅ 메시지 전송
    await interaction.reply({
      content: '🚫 클릭하지 말라니까~',
      files: [imageAttachment],
      flags: MessageFlags.None, // 공개 메시지
    });

    // ✅ 안정적으로 메시지 객체 가져오기
    const message = await interaction.fetchReply();

    // 2️⃣ 2초 뒤에 삭제
    setTimeout(() => {
      message.delete().catch((err) => console.error('[메시지 삭제 오류]', err));
    }, 2000);
  } catch (err) {
    console.error('[easter_egg 버튼 오류]', err);
    await interaction.reply({
      content: '❌ 이미지를 불러오는 중 오류가 발생했습니다.',
      flags: MessageFlags.Ephemeral, // 비공개 에러 메시지
    });

    // 에러 메시지도 잠시 뒤 삭제 (선택)
    setTimeout(async () => {
      try {
        await interaction.deleteReply();
      } catch (err2) {
        console.error('[에러 메시지 삭제 실패]', err2);
      }
    }, 5000);
  }
};
