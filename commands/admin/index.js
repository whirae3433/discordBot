const fs = require('fs');
const path = require('path');

const adminCommands = new Map();

function load(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      load(full);
      continue;
    }
    if (file.endsWith('.js')) {
      const cmd = require(full);
      if (!cmd?.name || typeof cmd.execute !== 'function') continue;
      adminCommands.set(cmd.name, cmd.execute);
    }
  }
}

load(__dirname); // admin 폴더 안만 스캔
module.exports = { adminCommands };
