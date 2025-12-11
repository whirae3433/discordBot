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

    if (!userId || !guild_id) {
      console.log('userId 또는 guild_id 누락 → DB 등록 생략');
      return res.redirect(`${BASE_URL}/invite-error`);
    }

    let serverName = null;
    try {
      const guildRes = await axios.get(
        'https://discord.com/api/users/@me/guilds',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const foundGuild = guildRes.data.find((g) => g.id === guild_id);
      if (foundGuild) {
        serverName = foundGuild.name;
        console.log(`[무영봇 초대] 서버 이름: ${serverName}`);
      }
    } catch (err) {
      console.log('guild 스코프 없음 → 서버 이름 가져오기 실패');
    }

    // servers 테이블에 등록 (이미 존재하면 이름만 갱신)
    await pool.query(
      `INSERT INTO servers (server_id, server_name)
       VALUES ($1, $2)
       ON CONFLICT (server_id)
       DO UPDATE SET server_name = EXCLUDED.server_name`,
      [guild_id, serverName || '(이름 불러오기 실패)']
    );

    // 이미 해당 서버에 main_admin이 존재하는지 확인
    const existing = await pool.query(
      `SELECT discord_id FROM bot_admins WHERE server_id = $1 AND is_main_admin = TRUE`,
      [guild_id]
    );

    if (existing.rowCount > 0) {
      console.log(`[무영봇 초대] ${guild_id} 서버는 이미 메인 관리자 등록됨`);
      return res.redirect(`${BASE_URL}/invite-already-exists`);
    }

    // 첫 등록이면 main_admin = TRUE로 저장
    await pool.query(
      `INSERT INTO bot_admins (server_id, discord_id, is_main_admin)
       VALUES ($1, $2, TRUE)
       ON CONFLICT DO NOTHING`,
      [guild_id, userId]
    );

    console.log(
      `[무영봇 초대] ${guild_id} 서버의 첫 메인 관리자 등록 완료 (${userId})`
    );

    // 완료 페이지로 이동
    res.redirect(`${BASE_URL}/invite-success`);
  } catch (err) {
    console.error('Invite Callback Error:', err.response?.data || err.message);
    res.status(500).send('Invite Callback Error');
  }
});

module.exports = router;
