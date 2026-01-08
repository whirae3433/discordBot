const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../pg/db');

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

// 로그인
router.get('/login', (req, res) => {
  const { serverId } = req.query;
  console.log(serverId);
  const discordAuthUrl =
    `https://discord.com/api/oauth2/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=identify%20guilds` +
    (serverId ? `&state=${encodeURIComponent(serverId)}` : '');
  res.redirect(discordAuthUrl);
});

// 로그인 상태에서 새로운 서버
router.post('/join-guild', async (req, res) => {
  try {
    const user = req.session.user;
    const { serverId } = req.body;

    if (!user) return res.status(401).json({ message: 'Not logged in' });
    if (!serverId)
      return res.status(400).json({ message: 'serverId required' });

    // 유저가 실제로 그 guild에 속해있는지 확인(세션에 guilds 저장해두니까 가능)
    const inGuild = user.guilds?.some((g) => String(g.id) === String(serverId));
    if (!inGuild) {
      return res.status(403).json({ message: 'Not in that guild' });
    }

    const discordName = user.globalName || user.username;

    await pool.query(
      `
      INSERT INTO members (server_id, discord_id, discord_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (server_id, discord_id)
      DO UPDATE SET discord_name = EXCLUDED.discord_name;
      `,
      [serverId, user.id, discordName]
    );

    // 옵션: 마지막 선택 서버 저장
    req.session.user.lastServerId = serverId;

    return res.json({ success: true });
  } catch (err) {
    console.error('[join-guild]', err);
    return res.status(500).json({ message: 'server error' });
  }
});

// 콜백
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  const serverId = req.query.state;

  if (!code) return res.status(400).send('Missing code');

  try {
    // 토큰 요청
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // 유저 정보 요청
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = userResponse.data;

    const guildsRes = await axios.get(
      'https://discord.com/api/users/@me/guilds',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // members 테이블에 (server_id, discord_id, discord_name) upsert
    // serverId가 없으면(웹 단독 로그인) 스킵
    if (serverId) {
      // 사용자가 실제로 그 서버에 속해있는지 1차 확인(선택이지만 강추)
      const inGuild = guildsRes.data?.some(
        (g) => String(g.id) === String(serverId)
      );

      if (inGuild) {
        const discordName = userData.global_name || userData.username; // 길드 닉은 아니지만 표시용으로 충분
        await pool.query(
          `
          INSERT INTO members (server_id, discord_id, discord_name)
          VALUES ($1, $2, $3)
          ON CONFLICT (server_id, discord_id)
          DO UPDATE SET discord_name = EXCLUDED.discord_name;
          `,
          [serverId, userData.id, discordName]
        );
      } else {
        console.warn(
          `[OAuth] user(${userData.id}) not in guild(${serverId}) → members upsert skipped`
        );
      }
    }

    // 세션 저장
    req.session.user = {
      id: userData.id,
      username: userData.username,
      globalName: userData.global_name ?? null,
      discriminator: userData.discriminator,
      avatar: userData.avatar,

      lastServerId: serverId ?? null,

      guilds: guildsRes.data.map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        owner: g.owner,
        permissions: g.permissions,
      })),
    };

    // 프론트로 리다이렉트
    res.redirect(`${FRONTEND_BASE_URL}/entry`);
  } catch (err) {
    console.error('OAuth2 Error:', err.response?.data || err.message);
    res.status(500).send('OAuth2 Error');
  }
});

// 로그인 상태 확인
router.get('/me', (req, res) => {
  if (req.session.user) {
    return res.json(req.session.user);
  } else {
    return res.status(401).json({ message: 'Not logged in' });
  }
});

// 로그아웃
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
