const fs = require('fs');
const path = require('path');

const commands = new Map();

function load(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      load(full);
      continue;
    }
    if (file.endsWith('.js')) {
      if (file === 'index.js') continue;

      const cmd = require(full);
      if (!cmd?.name) continue;
     commands.set(cmd.name, cmd);
    }
  }
}

load(__dirname);
module.exports.commands = commands;
