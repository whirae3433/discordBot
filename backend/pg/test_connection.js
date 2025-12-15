require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

async function testQuery() {
  try {
    const res = await pool.query('SELECT * FROM member_list;');
    console.log('조회 결과:', res.rows);
  } catch (err) {
    console.error('에러 발생:', err);
  } finally {
    await pool.end(); // 연결 종료
  }
}

testQuery();
