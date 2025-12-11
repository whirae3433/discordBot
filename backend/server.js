require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Client, GatewayIntentBits } = require('discord.js');
const handleInteraction = require('./interactions');
const startGuestStatusScheduler = require('./schedule/updateGuestStatusDaily');

const app = express();

// --- Discord Bot 초기화 ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 글로벌로 봇 객체 등록
global.botClient = client;

client.once('ready', () => {
  console.log(`✅ 로그인됨: ${client.user.tag}`);
  startGuestStatusScheduler(client);
});

client.on('interactionCreate', handleInteraction);

client.login(process.env.DISCORD_TOKEN);

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
app.use('/api/update', require('./routes/update'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/nickname', require('./routes/nickname'));
app.get('/api/:serverId/characters', require('./routes/read/listCharacters'));
app.use('/api/invite', require('./routes/invite'));
app.use('/api/report-item', require('./routes/reportItem'));


// 서버 실행
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server + Bot running on port ${PORT}`);
});
