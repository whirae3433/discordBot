const fs = require('fs');
const path = require('path');

const commands = [];

// commands 폴더 내의 모든 JS 파일 및 하위 폴더 탐색
const loadCommands = (dir) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadCommands(fullPath); // 하위 폴더 재귀 탐색
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);
      commands.push(command);
    }
  });
};

loadCommands(__dirname);

module.exports.commands = commands;

