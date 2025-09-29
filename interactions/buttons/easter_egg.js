const path = require('path');
const { AttachmentBuilder } = require('discord.js');

module.exports = async (interaction) => {
  try {
    const imagePath = path.join(__dirname, '../../public/이스터에그.jpeg');
    const imageAttachment = new AttachmentBuilder(imagePath);

    const sent = await interaction.reply({
      content: '🚫 클릭하지 말라니까~',
      files: [imageAttachment],
      ephemeral: false, // 삭제하려면 false
      fetchReply: true, // 메시지 객체 받기
    });
    // 2️⃣ 2초 뒤에 삭제
    setTimeout(() => {
      sent.delete().catch((err) => console.error('[메시지 삭제 오류]', err));
    }, 2000);
  } catch (err) {
    console.error('[easter_egg 버튼 오류]', err);
    await interaction.reply({
      content: '❌ 이미지를 불러오는 중 오류가 발생했습니다.',
      ephemeral: true,
    });
  }
};
