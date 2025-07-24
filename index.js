require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { messageHandlers } = require('./utils/messageHandlers');
const { scheduleDailyMessage } = require('./utils/scheduleMessage');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`✅ 로그인됨: ${client.user.tag}`);
  scheduleDailyMessage(client);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  for (const handler of messageHandlers) {
    const handled = await handler(message, client);
    if (handled) break;
  }
});

client.login(process.env.DISCORD_TOKEN);
