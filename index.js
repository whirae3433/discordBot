require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { messageHandlers } = require('./utils/messageHandlers');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 전역으로 client 저장
global.botClient = client;

client.once('ready', () => {
  console.log(`✅ 로그인됨: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  await messageHandlers(message, client);
});

client.login(process.env.DISCORD_TOKEN);
