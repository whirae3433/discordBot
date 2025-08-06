require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const updateRoutes = require('./routes/update/index.js');
const authRoutes = require('./routes/auth.js'); // OAuth 전용

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1일 유지
  })
);

// API 라우트
app.use('/api/update', updateRoutes);
app.use('/api/auth', authRoutes);

// React 정적 파일
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// SPA 라우팅
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
