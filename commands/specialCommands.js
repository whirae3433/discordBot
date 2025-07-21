module.exports.specialCommands = function (message) {
  const commands = {
    '!지노': () => message.channel.send({ files: ['./images/지노.jpg'] }),
    '!이케아': () => message.channel.send({ files: ['./images/dumb.jpg'] }),
    '!노을': () => message.reply('킹갓 황란'),
    '!C흥': () => message.reply('TIME의 매력덩이'),
    '!사슴': () => message.channel.send({ files: ['./images/사슴.jpeg'] }),
  };

  if (commands[message.content]) {
    commands[message.content]();
    return true;
  }
  return false;
};
