const path = require('path');
const sharp = require('sharp');
const channelConfigMap = require('../config');


module.exports.specialCommands = function (message) {
  const channelId = message.channel.id;
  const config = channelConfigMap[channelId];

  if (!config || !config.commands) return false;

  const commandConfig = config.commands[message.content];
  if (!commandConfig) return false;

  const { type, file, text, files } = commandConfig;
  const folderName = config.folderName;

  // 절대 경로 생성
  const resolvePath = (p) =>
    path.resolve(__dirname, `../discordChannel/${folderName}/${p}`);

  // !윈터 명령어에 대한 랜덤 이미지 처리
  if (
    message.content === '!윈터' &&
    type === 'image' &&
    Array.isArray(files) &&
    files.length > 0
  ) {
    const randomIndex = Math.floor(Math.random() * files.length); // 랜덤으로 인덱스 선택
    const randomImage = resolvePath(files[randomIndex]); // 랜덤 이미지 선택

    console.log(`📸 Sending random image: ${randomImage}`);

    // sharp로 이미지 리사이즈 처리
    sharp(randomImage)
      .resize(200, 300) // 500x500으로 리사이즈
      .toBuffer()
      .then((data) => {
        message.channel.send({
          files: [{ attachment: data, name: 'image.jpeg' }],
        });
      })
      .catch((err) => {
        console.error('이미지 리사이즈 중 에러 발생:', err); // 에러 발생 시 콘솔에 로그 출력
        message.channel.send(
          '이미지 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
        ); // 사용자에게 에러 메시지 전달
      });

    return true;
  }

  if (type === 'image' && file) {
    console.log(`📸 Sending image: ${file}`);
    message.channel.send({ files: [resolvePath(file)] });
  } else if (type === 'text' && text) {
    message.reply(text);
  } else {
    console.log('❌ 잘못된 commandConfig 구조');
  }

  return true;
};
