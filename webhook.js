const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const updateRoutes = require('./routes/update/index.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- API 라우트 (/api/update) ---
app.use('/api/update', updateRoutes);

// --- React 정적 파일 서빙 ---
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// SPA 라우팅 (API 제외)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
