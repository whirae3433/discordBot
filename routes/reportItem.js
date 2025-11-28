const express = require('express');
const router = express.Router();
const pool = require('../pg/db');

router.post('/', async (req, res) => {
  const { itemName } = req.body;

  if (!itemName || !itemName.trim()) {
    return res.json({ success: false, message: '아이템 이름이 없습니다.' });
  }

  try {
    await pool.query(
      `
      INSERT INTO reported_items (item_name) 
      VALUES ($1)
      `,
      [itemName.trim()]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('report-item insert error:', err);
    return res.json({ success: false, message: 'DB 오류' });
  }
});

module.exports = router;
