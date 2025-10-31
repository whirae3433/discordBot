const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../pg/db');

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_INVITE_REDIRECT_URI = process.env.DISCORD_INVITE_REDIRECT_URI;
const BASE_URL = process.env.BASE_URL;

router.get('/callback', async (req, res) => {
  const { code, guild_id } = req.query;
  if (!code) return res.status(400).send('Missing code');

  try {
    // code로 토큰 교환
    const tokenRes = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_INVITE_REDIRECT_URI,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenRes.data.access_token;

    // 초대한 유저 정보 조회 (identify 스코프가 포함돼야 작동)
    let userId = null;
    try {
      const userRes = await axios.get('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      userId = userRes.data.id;
      console.log('초대한 유저:', userRes.data.username);
    } catch {
      console.log('identify 스코프 없음 → 초대한 유저 ID 알 수 없음');
    }

    // 봇이 들어간 서버 ID 조회 (guild_id는 code 교환으로는 안 오므로 guildCreate에서 별도 처리)
    console.log('봇 초대 완료 콜백 실행됨');

    // DB 기록 (identify 스코프가 있다면)
    if (userId && guild_id) {
      await pool.query(
        `INSERT INTO bot_admins (server_id, discord_id, is_main_admin)
         VALUES ($1, $2, TRUE)
         ON CONFLICT DO NOTHING`,
        [guild_id, userId]
      );
    }

    // 완료 페이지로 이동
    res.redirect(`${BASE_URL}/invite-success`);
  } catch (err) {
    console.error('Invite Callback Error:', err.response?.data || err.message);
    res.status(500).send('Invite Callback Error');
  }
});

module.exports = router;
