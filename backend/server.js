const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8080;

// CORSの設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// JSON形式のリクエストを解析
app.use(express.json());

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({ 
    message: '美容師向け陰陽五行AIケアコンパニオン API', 
    status: 'ok',
    version: '1.0.0'
  });
});

// ヘルスチェックエンドポイント
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// API v1エンドポイント
app.get('/api/v1/fortune/daily', (req, res) => {
  // モックデータを返す
  res.json({
    id: '1',
    date: new Date().toISOString().split('T')[0],
    element: '木',
    yinYang: '陽',
    overallLuck: 85,
    careerLuck: 80,
    relationshipLuck: 75,
    dailyAdvice: '今日は新しいアイデアに取り組むのに良い日です。',
    compatibleElements: ['火', '木'],
    incompatibleElements: ['金', '土']
  });
});

// サーバー起動
app.listen(port, () => {
  console.log(`サーバーが起動しました: http://localhost:${port}`);
});