const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const updateRoutes = require('./routes/update/index.js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- GitHub Webhook (자동 배포)ㅁ ---
const { exec } = require('child_process');

app.post('/webhook', (req, res) => {
  res.send('OK'); // 즉시 응답 먼저 보내기
  console.log('GitHub webhook triggered');

  exec(
    'git pull && cd frontend && npm install && npm run build && cd .. && pm2 restart discord-bot',
    (err, stdout, stderr) => {
      if (err) {
        console.error('Git pull error:', stderr);
        return res.status(500).send('Error');
      }
      console.log('Git pull success:', stdout);
      res.send('OK');
    }
  );
});

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
