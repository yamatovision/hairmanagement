/**
 * シンプルなExpressサーバー - Cloud Run用に最適化
 */
const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 8080;

// すべてのリクエストをログに記録
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// ルートエンドポイント
app.get('/', (req, res) => {
  console.log('ルートエンドポイントにアクセスがありました');
  res.json({ 
    message: '美容師向け陰陽五行AIケアコンパニオン API',
    status: 'running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    hostname: os.hostname()
  });
});

// Google App Engineヘルスチェック
app.get('/_ah/health', (req, res) => {
  console.log('Google App Engineヘルスチェック');
  res.status(200).send('OK');
});

// 標準ヘルスチェック
app.get('/healthz', (req, res) => {
  console.log('標準ヘルスチェック');
  res.status(200).send('OK');
});

// 運勢日次API
app.get('/api/v1/fortune/daily', (req, res) => {
  res.json({
    id: 'fortune-123',
    userId: 'user-123',
    date: new Date().toISOString().split('T')[0],
    dailyElement: '水',
    yinYang: '陰',
    overallLuck: 85,
    careerLuck: 80,
    relationshipLuck: 90,
    creativeEnergyLuck: 75,
    healthLuck: 70,
    wealthLuck: 65,
    description: '今日は活力に満ちた一日になるでしょう。',
    advice: '直感を信じて行動すると良い結果が得られます。',
    luckyColors: ['青', '緑'],
    luckyDirections: ['北', '東'],
    compatibleElements: ['木', '水'],
    incompatibleElements: ['火', '土'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// 運勢範囲API
app.get('/api/v1/fortune/range', (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ message: '開始日と終了日が必要です' });
  }
  
  const results = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    results.push({
      id: `fortune-${dateStr}`,
      userId: 'user-123',
      date: dateStr,
      dailyElement: ['木', '火', '土', '金', '水'][Math.floor(Math.random() * 5)],
      yinYang: Math.random() > 0.5 ? '陰' : '陽',
      overallLuck: 50 + Math.floor(Math.random() * 50),
      careerLuck: 50 + Math.floor(Math.random() * 50),
      relationshipLuck: 50 + Math.floor(Math.random() * 50),
      creativeEnergyLuck: 50 + Math.floor(Math.random() * 50),
      healthLuck: 50 + Math.floor(Math.random() * 50),
      wealthLuck: 50 + Math.floor(Math.random() * 50),
      description: 'バランスの取れた日です。',
      advice: '前向きな姿勢で取り組みましょう。',
      luckyColors: ['青', '緑'],
      luckyDirections: ['北', '東'],
      compatibleElements: ['木', '水'],
      incompatibleElements: ['火', '土'],
      createdAt: date.toISOString(),
      updatedAt: date.toISOString()
    });
  }
  
  res.json(results);
});

// 週間運勢API
app.get('/api/v1/fortune/weekly', (req, res) => {
  const { startDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const endDate = end.toISOString().split('T')[0];
  
  const results = [];
  const days = 7;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    results.push({
      id: `fortune-${dateStr}`,
      userId: 'user-123',
      date: dateStr,
      dailyElement: ['木', '火', '土', '金', '水'][Math.floor(Math.random() * 5)],
      yinYang: Math.random() > 0.5 ? '陰' : '陽',
      overallLuck: 50 + Math.floor(Math.random() * 50),
      careerLuck: 50 + Math.floor(Math.random() * 50),
      relationshipLuck: 50 + Math.floor(Math.random() * 50),
      creativeEnergyLuck: 50 + Math.floor(Math.random() * 50),
      healthLuck: 50 + Math.floor(Math.random() * 50),
      wealthLuck: 50 + Math.floor(Math.random() * 50),
      description: 'バランスの取れた日です。',
      advice: '前向きな姿勢で取り組みましょう。',
      luckyColors: ['青', '緑'],
      luckyDirections: ['北', '東'],
      compatibleElements: ['木', '水'],
      incompatibleElements: ['火', '土'],
      createdAt: date.toISOString(),
      updatedAt: date.toISOString()
    });
  }
  
  res.json(results);
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('エラーが発生しました:', err);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// サーバー起動
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`シンプルサーバーが起動しました: http://0.0.0.0:${PORT}`);
  console.log(`環境変数PORT: ${process.env.PORT}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});

// 適切なシャットダウン処理
process.on('SIGTERM', () => {
  console.log('SIGTERMを受信しました。サーバーをシャットダウンします...');
  server.close(() => {
    console.log('サーバーを正常にシャットダウンしました');
    process.exit(0);
  });
});