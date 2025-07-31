const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../data/discordServers');
const channelConfigMap = {};

// 폴더 내 json 파일 재귀 탐색
function loadJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // 폴더면 재귀탐색
      loadJsonFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      const config = require(fullPath);
      for (const [channelId, data] of Object.entries(config)) {
        channelConfigMap[channelId] = data;
      }
    }
  }
}

loadJsonFiles(baseDir);

module.exports = channelConfigMap;
