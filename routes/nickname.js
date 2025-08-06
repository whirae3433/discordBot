const express = require('express');
const router = express.Router();
const { sheets } = require('../utils/googleSheets'); // 이미 인증된 sheets 불러오기

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

/**
 * 닉네임 조회 API
 * GET /api/nickname/:serverId/:userId
 */
router.get('/:serverId/:userId', async (req, res) => {
  const { serverId, userId } = req.params;

  try {
    // 해당 서버 시트의 A:D 범위 데이터 가져오기
    const range = `${serverId}!A:D`; // serverId 시트명 기준
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range,
    });

    const rows = response.data.values || [];
    // 첫번째 열(userId) 기준으로 탐색
    const userRow = rows.find((row) => row[0] === userId);

    if (!userRow) {
      return res.status(404).json({ nickname: null });
    }

    const nickname = userRow[3]; // 두 번째 열이 닉네임
    res.json({ nickname });
  } catch (error) {
    console.error('Nickname API Error:', error);
    res.status(500).json({ error: 'Nickname fetch failed' });
  }
});

module.exports = router;
