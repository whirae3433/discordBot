require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./pg/db');
const { buildRoomState } = require('./services/timer/buildRoomState');

const { Client, GatewayIntentBits } = require('discord.js');
const handleInteraction = require('./interactions');
const startGuestStatusScheduler = require('./schedule/updateGuestStatusDaily');
const startRecruitScheduler = require('./schedule/recruit_scheduler');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONT_ORIGIN = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

// 1) Basic middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// CORS (세션 쿠키 포함 필수)
app.use(
  cors({
    origin: FRONT_ORIGIN,
    credentials: true,
  }),
);

// 2) Session (단 1번만!)
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax',
    secure: false, // 로컬 http
  },
});

app.use(sessionMiddleware);

// 3) Debug logger (timer만)
app.use((req, res, next) => {
  if (req.path.startsWith('/timer')) {
    console.log('---- TIMER REQ ----');
    console.log('path:', req.method, req.path);
    console.log('cookie header:', req.headers.cookie);
    console.log('session.user?.id:', req.session?.user?.id);
  }
  next();
});

// 4) req.user bridge
app.use((req, res, next) => {
  const discordId =
    req.session?.discord_id || req.session?.discordId || req.session?.user?.id;

  if (discordId) req.user = { discord_id: String(discordId) };
  next();
});

// 5) API routes
app.use('/api/update', require('./routes/update'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/nickname', require('./routes/nickname'));
app.get('/api/:serverId/characters', require('./routes/read/listCharacters'));
app.use('/api/invite', require('./routes/invite'));
app.use('/api/report-item', require('./routes/reportItem'));

// timer routes
app.use('/timer', require('./routes/timer/index'));

// 6) HTTP server + Socket.IO
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: FRONT_ORIGIN,
    credentials: true,
  },
});

// 라우터에서 io를 쓰게 해줌
app.set('io', io);

// Socket에도 세션 붙이기
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

// Socket 인증 (세션.user.id 기준)
io.use((socket, next) => {
  const user = socket.request.session?.user;
  if (!user?.id) return next(new Error('UNAUTHORIZED'));
  socket.user = { discord_id: String(user.id) };
  next();
});

global.io = io;

io.on('connection', (socket) => {
  socket.on('room:join', async ({ roomId }) => {
    if (!roomId) return;

    const discordId = socket.user?.discord_id;
    if (!discordId) {
      return socket.emit('room:error', { roomId, message: 'UNAUTHORIZED' });
    }

    const rid = String(roomId);

    try {
      // 0) 방 닫힘 체크
      const roomOpen = await pool.query(
        `
        select 1
        from timer_rooms
        where id = $1 and closed_at is null
        limit 1
        `,
        [rid],
      );

      if (roomOpen.rowCount === 0) {
        return socket.emit('room:error', {
          roomId: rid,
          message: 'ROOM_CLOSED',
        });
      }

      // 1) 멤버인지 체크
      const mem = await pool.query(
        `
        select 1
        from timer_room_members
        where room_id = $1 and discord_id = $2 and left_at is null
        limit 1
        `,
        [rid, String(discordId)],
      );

      if (mem.rowCount === 0) {
        return socket.emit('room:error', {
          roomId: rid,
          message: 'NOT_A_MEMBER',
        });
      }

      // 2) 방 조인 ( String 통일)
      socket.join(rid);

      // 3) 상태 내려주기
      const payload = await buildRoomState(rid);
      socket.emit('room:state', payload);

      // (선택) join 성공 알림
      socket.emit('room:joined', { roomId: rid });
    } catch (e) {
      console.error(e);
      socket.emit('room:error', { roomId: rid, message: 'JOIN_FAILED' });
    }
  });

  socket.on('room:leave', ({ roomId }) => {
    if (!roomId) return;
    socket.leave(String(roomId));
  });
});

// 7) Discord bot init
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

global.botClient = bot;

bot.once('ready', () => {
  console.log(`✅ 로그인됨: ${bot.user.tag}`);
  startGuestStatusScheduler(bot);
  startRecruitScheduler(bot);
});

bot.on('interactionCreate', handleInteraction);
bot.login(process.env.DISCORD_TOKEN);

// 8) Listen
httpServer.listen(PORT, () => {
  console.log(`Server + Bot + Socket running on port ${PORT}`);
});
