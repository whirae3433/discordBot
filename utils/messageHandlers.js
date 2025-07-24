const { commands } = require('../commands');

module.exports.messageHandlers = commands.map(
  (cmd) => async (message, client) => {
    const handled = await cmd(message, client);
    return handled;
  }
);
