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
  // チーム一覧取得
  app.get(`${apiPrefix}/teams`, (req, res) => {
    console.log('チーム一覧エンドポイントへのアクセス');
    res.json({
      success: true,
      data: [
        {
          id: 'team-123',
          name: 'チームA',
          description: 'テストチーム',
          ownerId: 'user-123',
          admins: [],
          members: [
            {
              userId: 'user-456',
              role: 'member',
              joinedAt: new Date().toISOString()
            }
          ],
          isActive: true,
          goal: 'テスト目標',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });
  });

  // チーム作成
  app.post(`${apiPrefix}/teams`, (req, res) => {
    console.log('チーム作成エンドポイントへのアクセス:', req.body);
    res.status(201).json({
      success: true,
      data: {
        id: 'team-' + Math.random().toString(36).substring(2, 7),
        name: req.body.name || 'テストチーム',
        description: req.body.description || 'テスト説明',
        ownerId: 'user-123',
        admins: [],
        members: [],
        isActive: true,
        goal: req.body.goal || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  });

  // チーム詳細取得
  app.get(`${apiPrefix}/teams/:teamId`, (req, res) => {
    console.log(`チーム詳細エンドポイントへのアクセス: ${req.params.teamId}`);
    res.json({
      success: true,
      data: {
        id: req.params.teamId,
        name: 'チームA',
        description: 'テストチーム',
        ownerId: 'user-123',
        admins: [],
        members: [
          {
            userId: 'user-456',
            role: 'member',
            joinedAt: new Date().toISOString()
          }
        ],
        isActive: true,
        goal: 'テスト目標',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  });

  // チーム更新
  app.put(`${apiPrefix}/teams/:teamId`, (req, res) => {
    console.log(`チーム更新エンドポイントへのアクセス: ${req.params.teamId}`, req.body);
    res.json({
      success: true,
      data: {
        id: req.params.teamId,
        name: req.body.name || 'チームA',
        description: req.body.description || 'テストチーム',
        ownerId: 'user-123',
        admins: [],
        members: [
          {
            userId: 'user-456',
            role: 'member',
            joinedAt: new Date().toISOString()
          }
        ],
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        goal: req.body.goal || 'テスト目標',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  });

  // チーム削除
  app.delete(`${apiPrefix}/teams/:teamId`, (req, res) => {
    console.log(`チーム削除エンドポイントへのアクセス: ${req.params.teamId}`);
    res.status(204).end();
  });

  // チームメンバー追加
  app.post(`${apiPrefix}/teams/:teamId/members`, (req, res) => {
    console.log(`チームメンバー追加エンドポイントへのアクセス: ${req.params.teamId}`, req.body);
    res.json({
      success: true,
      data: {
        id: req.params.teamId,
        name: 'チームA',
        description: 'テストチーム',
        ownerId: 'user-123',
        admins: [],
        members: [
          {
            userId: req.body.userId || 'self',
            role: req.body.role || 'member',
            joinedAt: new Date().toISOString()
          },
          {
            userId: 'user-456',
            role: 'member',
            joinedAt: new Date().toISOString()
          }
        ],
        isActive: true,
        goal: 'テスト目標',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  });

  // チームメンバー削除
  app.delete(`${apiPrefix}/teams/:teamId/members/:memberId`, (req, res) => {
    console.log(`チームメンバー削除エンドポイントへのアクセス: ${req.params.teamId}/${req.params.memberId}`);
    res.json({
      success: true,
      data: {
        id: req.params.teamId,
        name: 'チームA',
        description: 'テストチーム',
        ownerId: 'user-123',
        admins: [],
        members: [
          {
            userId: 'user-456',
            role: 'member',
            joinedAt: new Date().toISOString()
          }
        ],
        isActive: true,
        goal: 'テスト目標',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  });

  // メンバー役割更新
  app.put(`${apiPrefix}/teams/:teamId/members/:memberId/role`, (req, res) => {
    console.log(`メンバー役割更新エンドポイントへのアクセス: ${req.params.teamId}/${req.params.memberId}`, req.body);
    res.json({
      success: true,
      data: {
        id: req.params.teamId,
        name: 'チームA',
        description: 'テストチーム',
        ownerId: 'user-123',
        admins: [],
        members: [
          {
            userId: req.params.memberId,
            role: req.body.role || 'admin',
            joinedAt: new Date().toISOString()
          },
          {
            userId: 'user-456',
            role: 'member',
            joinedAt: new Date().toISOString()
          }
        ],
        isActive: true,
        goal: 'テスト目標',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  });

  // チーム相性分析
  app.get(`${apiPrefix}/teams/:teamId/compatibility`, (req, res) => {
    console.log(`チーム相性分析エンドポイントへのアクセス: ${req.params.teamId}`);
    res.json({
      success: true,
      data: {
        teamId: req.params.teamId,
        elementDistribution: {
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
        complementaryRelations: [
          {
            userId1: 'user-123',
            userId2: 'user-456',
            compatibilityScore: 85,
            relationshipType: '相生',
            complementaryAreas: ['創造力', '実行力']
          }
        ],
        teamStrengths: ['創造的な発想力', '安定した実行力'],
        teamWeaknesses: ['計画性の欠如', '柔軟性の不足'],
        optimizationSuggestions: [
          {
            type: 'recruitment',
            description: '「金」属性の人材を追加し、チームの分析力と精度を強化する',
            priority: 'high'
          },
          {
            type: 'development',
            description: '「木」属性メンバーの創造的発想を活かしたブレインストーミングセッションの導入',
            priority: 'medium'
          }
        ]
      }
    });
  });

  // メンバー招待
  app.post(`${apiPrefix}/teams/:teamId/invite`, (req, res) => {
    console.log(`メンバー招待エンドポイントへのアクセス: ${req.params.teamId}`, req.body);
    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        teamId: req.params.teamId,
        email: req.body.email || 'test@example.com',
        role: req.body.role || 'member',
        sent: true
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