const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const isValidImage = (buffer) => {
  try {
    // sharp가 이미지 포맷 읽을 수 있는지 확인
    sharp(buffer);
    return true;
  } catch {
    return false;
  }
};

async function cropCenterSquare(url, size = 256) {
  const tempDir = path.resolve(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, 'thumbnail.png');

  try {
    const response = await axios({ url, responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    if (!isValidImage(buffer)) {
      // sharp에서 못 읽으면 기본 PNG로 fallback
      const fallback = path.resolve(__dirname, '../public/기본.jpeg');
      fs.copyFileSync(fallback, tempPath);
      return tempPath;
    }

    await sharp(buffer)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png()
      .toFile(tempPath);

    return tempPath;
  } catch (err) {
    console.error('[cropCenterSquare] 변환 실패:', err.message);
    // fallback 기본 이미지
    const fallback = path.resolve(__dirname, '../public/기본.jpeg');
    fs.copyFileSync(fallback, tempPath);
    return tempPath;
  }
}

module.exports = { cropCenterSquare };
