const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://dailyfortune-app.web.app',
  credentials: true
}));

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({ 
    message: '美容師向け陰陽五行AIケアコンパニオン API',
    status: 'running',
    environment: process.env.NODE_ENV
  });
});

// APIエンドポイント
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});