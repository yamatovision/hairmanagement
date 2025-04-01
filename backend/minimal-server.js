/**
 * 最小限のExpressサーバー - 開発用
 * TypeScriptエラーを回避し、基本的なAPIを提供
 */
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const os = require('os');

// アプリケーションの初期化
console.log('最小限サーバーを起動します...');
const app = express();
const PORT = process.env.PORT || 5001;

// JWT認証用の秘密鍵
const JWT_SECRET = process.env.JWT_SECRET || 'patrol_management_jwt_secret_development';
const JWT_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRATION || '1d';

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(morgan('dev'));

// CORSの設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// シンプルな認証ミドルウェア
const authMiddleware = (req, res, next) => {
  // Bearerトークンを取得
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: '認証トークンが必要です' });
  }
  
  try {
    // トークンを検証
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '無効なトークンです' });
  }
};

// APIルートの設定
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';
const baseApiPath = `${apiPrefix}/${apiVersion}`;

// 認証関連API
app.post(`${baseApiPath}/auth/login`, (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'メールアドレスとパスワードが必要です' 
    });
  }
  
  // 簡易認証 - 開発用
  const user = {
    id: 'user-123',
    email: email,
    name: 'テストユーザー',
    role: 'user',
    element: '木',
    yinYang: '陽'
  };
  
  // JWTトークンを生成
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  res.json({
    success: true,
    message: 'ログイン成功',
    data: {
      user,
      token,
      refreshToken: 'test-refresh-token-67890'
    }
  });
});

app.post(`${baseApiPath}/auth/register`, (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ 
      success: false, 
      message: '必須項目が不足しています' 
    });
  }
  
  // 新規ユーザー作成（モック）
  const user = {
    id: `user-${Date.now()}`,
    email,
    name,
    role: 'user',
    element: '木',
    yinYang: '陽',
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    message: 'ユーザー登録成功',
    data: { user }
  });
});

app.get(`${baseApiPath}/auth/me`, authMiddleware, (req, res) => {
  // 認証済みユーザー情報を返す
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: 'テストユーザー',
        role: req.user.role,
        element: '木',
        yinYang: '陽'
      }
    }
  });
});

// クリーンアーキテクチャ対応
app.get(`${baseApiPath}/users/me`, authMiddleware, (req, res) => {
  // 認証済みユーザー情報を返す
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: 'テストユーザー',
        role: req.user.role,
        element: '木',
        yinYang: '陽',
        profileImage: null
      }
    }
  });
});

// 運勢関連API
app.get(`${baseApiPath}/fortune/daily`, authMiddleware, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  res.json({
    success: true,
    data: {
      id: `fortune-${today}`,
      userId: req.user.id,
      date: today,
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
    }
  });
});

app.get(`${baseApiPath}/fortune/range`, authMiddleware, (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ 
      success: false,
      message: '開始日と終了日が必要です' 
    });
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
      userId: req.user.id,
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
  
  res.json({
    success: true,
    data: results
  });
});

app.get(`${baseApiPath}/fortune/weekly`, authMiddleware, (req, res) => {
  const { startDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date();
  
  const results = [];
  const days = 7;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    results.push({
      id: `fortune-${dateStr}`,
      userId: req.user.id,
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
  
  res.json({
    success: true,
    data: results
  });
});

// チーム情報API（最小限）
app.get(`${baseApiPath}/teams`, authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'team-123',
        name: 'テストチーム',
        description: 'これはテストチームです',
        members: [
          {
            userId: req.user.id,
            role: 'owner',
            status: 'active',
            joinedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  });
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({
    status: 'up',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    memory: process.memoryUsage(),
    cpu: os.cpus().length
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Cloud Run用ヘルスチェック
app.get('/_ah/health', (req, res) => {
  res.status(200).send('OK');
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({ 
    message: '美容師向け陰陽五行AIケアコンパニオン API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'リソースが見つかりません' });
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error('エラーが発生しました:', err);
  res.status(500).json({ 
    success: false, 
    message: 'サーバーエラーが発生しました',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// サーバー起動
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`最小限サーバーが起動しました: http://0.0.0.0:${PORT}`);
  console.log(`APIエンドポイント: http://0.0.0.0:${PORT}${baseApiPath}`);
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