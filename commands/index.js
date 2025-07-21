const { rewardCommand } = require('./rewardCommand');
const { priceCommand } = require('./priceCommand');
const { specialCommands } = require('./specialCommands');

module.exports.commands = [rewardCommand, priceCommand, specialCommands];
