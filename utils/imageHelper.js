const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function cropCenterSquare(url, size = 256) {
  // temp 폴더 경로 지정
  const tempDir = path.resolve(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true }); // temp 폴더 없으면 생성
  }

  const tempPath = path.join(tempDir, 'thumbnail.png');

  // 이미지 다운로드
  const response = await axios({ url, responseType: 'arraybuffer' });

  // 중앙 크롭 후 리사이즈
  await sharp(response.data)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .toFile(tempPath);

  return tempPath; // 로컬 경로 반환
}

module.exports = { cropCenterSquare };
