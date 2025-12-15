const express = require('express');
const axios = require('axios');
const router = express.Router();
const pool = require('../pg/db');

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;
const BASE_URL = process.env.BASE_URL;

// 로그인
router.get('/login', (req, res) => {
  const { serverId } = req.query;
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=identify&state=${serverId}`;
  res.redirect(discordAuthUrl);
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
        scope: 'identify',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // 유저 정보 요청
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = userResponse.data;

    const nicknameResponse = await axios.get(
      `${BASE_URL}/api/nickname/${serverId}/${userData.id}`
    );

    // 세션 저장
    req.session.user = {
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: userData.avatar,
      nickname: nicknameResponse.data.nickname,
    };

    // 프론트로 리다이렉트
    res.redirect(`${FRONTEND_BASE_URL}/${serverId}/profile/${userData.id}`);
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
