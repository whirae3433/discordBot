const express = require('express');
const router = express.Router();

/**
 * IGN(닉네임) 조회
 * GET /api/nickname/:serverId/:userId
 */
router.get('/:serverId/:userId', async (req, res) => {
  try {
    const { serverId, userId } = req.params;

    // Discord 봇 클라이언트에서 서버/멤버 정보 가져오기
    const guild = await global.botClient.guilds.fetch(serverId);
    const member = await guild.members.fetch(userId);
    
    // 우선순위: 서버 별명 → 전역 표시 이름 → username
    const displayName =
      member.nickname || member.user.globalName || member.user.username;

    res.json({ nickname: displayName });
  } catch (err) {
    console.error('Nickname API Error:', err);
    res.status(500).json({ error: '닉네임 조회 실패' });
  }
});

module.exports = router;
