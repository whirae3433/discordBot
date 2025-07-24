const { rewardCommand } = require('./rewardCommand');
const { priceCommand } = require('./priceCommand');
const { specialCommands } = require('./specialCommands');
const { adminCommands } = require('./adminCommands');

module.exports.commands = [adminCommands, rewardCommand, priceCommand, specialCommands];
