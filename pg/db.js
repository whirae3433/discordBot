// pg/db.js
require('dotenv').config();    // 경로 자동 처리
const { Pool, types } = require('pg');

// BIGINT → string
types.setTypeParser(20, (val) => val);

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

module.exports = pool;
