require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { Client, GatewayIntentBits } = require('discord.js');
const { messageHandlers } = require('./utils/messageHandlers.js');
const handleInteraction = require('./interactions');

// --- Discord Bot 초기화 ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 글로벌로 봇 객체 등록
global.botClient = client;

client.once('ready', () => {
  console.log(`✅ 로그인됨: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  await messageHandlers(message, client);
});

client.on('interactionCreate', handleInteraction);

client.login(process.env.DISCORD_TOKEN);

// --- Express 초기화 ---
const updateRoutes = require('./routes/update/index.js');
const authRoutes = require('./routes/auth.js');
const nicknameRoutes = require('./routes/nickname.js');
const listCharacters = require('./routes/read/listCharacters');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1일
  })
);

// API 라우트
app.use('/api/update', updateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/nickname', nicknameRoutes);
app.get('/api/:serverId/characters', listCharacters);
app.use('/api/invite', require('./routes/invite'));

// React 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// SPA 라우팅 (API 제외)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server + Bot running on port ${PORT}`);
});
