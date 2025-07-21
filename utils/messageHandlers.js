const { commands } = require('../commands');

module.exports.messageHandlers = commands.map((cmd) => async (message) => {
  const handled = await cmd(message);
  return handled;
});
