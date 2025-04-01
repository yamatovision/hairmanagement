/**
 * 最小限のExpressサーバー - Cloud Run用に最適化
 * TypeScriptコードの代わりに直接使用可能な最小限のJavaScriptサーバー
 */
const express = require('express');
const cors = require('cors');
const os = require('os');

// アプリケーションの初期化
const app = express();
const PORT = process.env.PORT || 8080;

// 機能フラグ
const FEATURES = process.env.FEATURES || 'all';
console.log(`構成された機能: ${FEATURES}`);

// 機能フラグを解析
const enabledFeatures = {};
if (FEATURES === 'all') {
  enabledFeatures.auth = true;
  enabledFeatures.fortune = true;
  enabledFeatures.team = true;
  enabledFeatures.analytics = true;
  enabledFeatures.conversation = true;
} else {
  enabledFeatures.auth = FEATURES.includes('auth');
  enabledFeatures.fortune = FEATURES.includes('fortune');
  enabledFeatures.team = FEATURES.includes('team');
  enabledFeatures.analytics = FEATURES.includes('analytics');
  enabledFeatures.conversation = FEATURES.includes('conversation');
  // coreは特殊扱い
  enabledFeatures.core = FEATURES.includes('core');
}

// 有効化された機能を文字列化
const getEnabledFeaturesString = () => {
  const features = [];
  if (enabledFeatures.auth) features.push('認証');
  if (enabledFeatures.fortune) features.push('運勢');
  if (enabledFeatures.team) features.push('チーム');
  if (enabledFeatures.analytics) features.push('分析');
  if (enabledFeatures.conversation) features.push('会話');
  return features.join(', ');
};

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// すべてのリクエストをログに記録
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// APIプレフィックスとバージョン
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';
const baseApiPath = `${apiPrefix}/${apiVersion}`;

// 認証エンドポイント
app.post(`${baseApiPath}/auth/login`, (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'メールアドレスとパスワードが必要です' 
    });
  }
  
  res.json({
    success: true,
    message: 'ログイン成功',
    data: {
      user: {
        id: 'user-123',
        email: email,
        name: 'テストユーザー',
        role: 'user',
        element: '水',
        yinYang: '陰'
      },
      token: 'test-jwt-token-12345',
      refreshToken: 'test-refresh-token-67890'
    }
  });
});

// ユーザー情報
app.get(`${baseApiPath}/auth/me`, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'テストユーザー',
        role: 'user',
        element: '水',
        yinYang: '陰'
      }
    }
  });
});

// 運勢日次API（運勢機能が有効な場合のみ）
if (enabledFeatures.fortune) {
  app.get(`${baseApiPath}/fortune/daily`, (req, res) => {
    console.log('運勢日次エンドポイントへのアクセス');
    res.json({
      success: true,
      data: {
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
      }
    });
  });
}

// チーム情報（チーム機能が有効な場合のみ）
if (enabledFeatures.team) {
  app.get(`${baseApiPath}/teams`, (req, res) => {
    console.log('チーム一覧エンドポイントへのアクセス');
    res.json({
      success: true,
      data: {
        teams: [
          {
            id: 'team-123',
            name: 'チームA',
            description: 'テストチーム',
            members: ['user-123', 'user-456'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }
    });
  });
}

// 会話履歴（会話機能が有効な場合のみ）
if (enabledFeatures.conversation) {
  app.get(`${baseApiPath}/conversation/history`, (req, res) => {
    console.log('会話履歴エンドポイントへのアクセス');
    res.json({
      success: true,
      data: {
        conversations: [
          {
            id: 'conv-123',
            userId: 'user-123',
            title: 'テスト会話',
            messages: [
              { role: 'user', content: 'こんにちは' },
              { role: 'assistant', content: 'こんにちは、どのようにお手伝いできますか？' }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }
    });
  });
}

// 分析データ（分析機能が有効な場合のみ）
if (enabledFeatures.analytics) {
  app.get(`${baseApiPath}/analytics/team`, (req, res) => {
    console.log('チーム分析エンドポイントへのアクセス');
    res.json({
      success: true,
      data: {
        analytics: {
          teamId: 'team-123',
          overallRating: 85,
          elementBalance: {
            wood: 25,
            fire: 15,
            earth: 20,
            metal: 15,
            water: 25
          },
          yinYangBalance: {
            yin: 40,
            yang: 60
          },
          teamCompatibility: 75,
          recommendations: [
            '金のエネルギーを持つメンバーを追加すると良いでしょう',
            '陰の性質を持つメンバーをもう少し増やすと、チームのバランスが改善されます'
          ]
        }
      }
    });
  });
}

// ルートエンドポイント
app.get('/', (req, res) => {
  if (req.headers['user-agent']?.includes('Google-Cloud-Run')) {
    console.log('Cloud Runヘルスチェック検出');
    return res.status(200).send('OK - Cloud Run Health Check');
  }
  
  console.log('ルートエンドポイントにアクセスがありました');
  res.json({ 
    message: '美容師向け陰陽五行AIケアコンパニオン API',
    status: 'running',
    enabled_features: getEnabledFeaturesString(),
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

// 404ハンドラー
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false, 
    message: 'リソースが見つかりません' 
  });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('エラーが発生しました:', err);
  res.status(500).json({ 
    success: false, 
    message: 'サーバーエラーが発生しました' 
  });
});

// サーバー起動
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`シンプルサーバーが起動しました: http://0.0.0.0:${PORT}`);
  console.log(`環境変数PORT: ${process.env.PORT}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`有効化された機能: ${getEnabledFeaturesString()}`);
});

// 適切なシャットダウン処理
process.on('SIGTERM', () => {
  console.log('SIGTERMを受信しました。サーバーをシャットダウンします...');
  server.close(() => {
    console.log('サーバーを正常にシャットダウンしました');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINTを受信しました。サーバーをシャットダウンします...');
  server.close(() => {
    console.log('サーバーを正常にシャットダウンしました');
    process.exit(0);
  });
});