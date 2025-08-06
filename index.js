require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { messageHandlers } = require('./utils/messageHandlers');
const express = require('express');

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

// -------------------- 닉네임 조회 API --------------------
const app = express();

app.get('/nickname/:serverId/:userId', async (req, res) => {
  try {
    const { serverId, userId } = req.params;
    const guild = await global.botClient.guilds.fetch(serverId);
    const member = await guild.members.fetch(userId);

    res.json({ nickname: member.nickname || member.user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '닉네임 조회 실패' });
  }
});

app.listen(4000, () => console.log('Nickname API running on port 4000'));
