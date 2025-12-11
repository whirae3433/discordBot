const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands/slash');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/slash/${file}`);

  if (!command.data || typeof command.data.toJSON !== 'function') {
    console.warn(`[WARN] 잘못된 슬래시 커맨드 파일: ${file}`);
    continue;
  }

  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🌐 Registering slash commands ...');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );

    console.log('✨ Slash commands registered successfully!');
  } catch (error) {
    console.error(error);
  }
})();
