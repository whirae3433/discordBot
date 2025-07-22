const fs = require('fs');
const path = require('path');

const jsonDir = path.join(__dirname, 'json');
const jsonFiles = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'));

const channelConfigMap = {};

for (const file of jsonFiles) {
  const config = require(path.join(jsonDir, file));
  for (const [channelId, data] of Object.entries(config)) {
    channelConfigMap[channelId] = data;
  }
}

module.exports = channelConfigMap;
