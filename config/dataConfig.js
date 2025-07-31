const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../data/discordServers');

// 최종 합쳐질 객체
const serverConfigs = {};

// 폴더 내 모든 JSON 파일 읽기
fs.readdirSync(dataDir)
  .filter((file) => file.endsWith('.json'))
  .forEach((file) => {
    const filePath = path.join(dataDir, file);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // jsonData는 { "serverId": { ... } } 형태이므로 key를 그대로 병합
    Object.assign(serverConfigs, jsonData);
  });
module.exports = serverConfigs;
