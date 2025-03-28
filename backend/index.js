// 完全なバックエンドAPI実装
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8080;

// CORS設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://dailyfortune-app.web.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ヘルスチェックエンドポイント
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({ 
    message: '美容師向け陰陽五行AIケアコンパニオン API',
    status: 'ok',
    version: '1.0.0'
  });
});

// ダミー認証API
app.post('/api/v1/auth/login', (req, res) => {
  console.log('Login request received');
  res.json({
    success: true,
    data: {
      token: 'dummy-jwt-token',
      user: {
        id: '1',
        name: 'テストユーザー',
        email: 'test@example.com',
        role: 'user',
        birthDate: '1990-01-01',
        element: '木',
        yinYang: '陽'
      }
    }
  });
});

// ダミーログアウトエンドポイント
app.post('/api/v1/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'ログアウト成功'
  });
});

// ユーザー情報取得エンドポイント
app.get('/api/v1/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      name: 'テストユーザー',
      email: 'test@example.com',
      role: 'user',
      birthDate: '1990-01-01',
      element: '木',
      yinYang: '陽'
    }
  });
});

// ダミー運勢API - デイリー
app.get('/api/v1/fortune/daily', (req, res) => {
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

// ダミー運勢API - 週間/範囲
app.get('/api/v1/fortune/range', (req, res) => {
  const startDate = req.query.startDate || new Date().toISOString().split('T')[0];
  const endDate = req.query.endDate;
  
  // 日付の範囲のダミーデータを生成
  const startDay = new Date(startDate);
  const endDay = new Date(endDate || startDate);
  const days = Math.round((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1;
  
  const fortunes = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDay);
    date.setDate(date.getDate() + i);
    
    fortunes.push({
      id: `${i + 1}`,
      date: date.toISOString().split('T')[0],
      element: ['木', '火', '土', '金', '水'][Math.floor(Math.random() * 5)],
      yinYang: Math.random() > 0.5 ? '陽' : '陰',
      overallLuck: Math.floor(Math.random() * 30) + 70,
      careerLuck: Math.floor(Math.random() * 40) + 60,
      relationshipLuck: Math.floor(Math.random() * 40) + 60,
      dailyAdvice: [
        '今日は新しいアイデアに取り組むのに良い日です。',
        '人間関係を大切にする日です。',
        '健康に気を使いましょう。',
        '直感を信じてください。',
        '計画を見直す時期です。'
      ][Math.floor(Math.random() * 5)],
      compatibleElements: ['火', '木'],
      incompatibleElements: ['金', '土']
    });
  }
  
  res.json(fortunes);
});

// 会話履歴API
app.get('/api/v1/conversation', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const archived = req.query.archived === 'true';
  
  // ダミーの会話履歴データ
  const conversations = [];
  const total = 20;
  
  for (let i = 0; i < Math.min(limit, total); i++) {
    const id = (page - 1) * limit + i + 1;
    conversations.push({
      id: `conv-${id}`,
      title: `会話 ${id}`,
      lastMessage: `これは会話 ${id} の最後のメッセージです。`,
      createdAt: new Date(Date.now() - id * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - id * 3600000).toISOString(),
      archived: archived,
      messageCount: Math.floor(Math.random() * 10) + 1
    });
  }
  
  res.json({
    data: conversations,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
});

// 会話メッセージAPI
app.get('/api/v1/conversation/:id', (req, res) => {
  const id = req.params.id;
  
  // ダミーのメッセージデータ
  const messages = [];
  for (let i = 0; i < 5; i++) {
    messages.push({
      id: `msg-${id}-${i}`,
      conversationId: id,
      content: `これは会話 ${id} のメッセージ ${i+1} です。`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      createdAt: new Date(Date.now() - (5-i) * 60000).toISOString()
    });
  }
  
  res.json({
    id,
    title: `会話 ${id}`,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
    messages
  });
});

// 呼び水質問生成API
app.post('/api/v1/conversation/generate-prompt', (req, res) => {
  // ランダムな呼び水質問
  const prompts = [
    '今日はどのような髪型にしたいですか？',
    '最近、髪の調子はいかがですか？',
    '普段どのようなヘアケアをされていますか？',
    '理想のヘアスタイルを教えてください',
    '髪の悩みはありますか？'
  ];
  
  res.json({
    prompt: prompts[Math.floor(Math.random() * prompts.length)]
  });
});

// チームデータAPI
app.get('/api/v1/teams', (req, res) => {
  res.json({
    data: [
      {
        id: 'team-1',
        name: 'Aチーム',
        description: '美容師チーム',
        members: [
          {
            id: 'user-1',
            name: '山田太郎',
            role: 'manager',
            element: '木',
            yinYang: '陽'
          },
          {
            id: 'user-2',
            name: '佐藤花子',
            role: 'member',
            element: '火',
            yinYang: '陰'
          }
        ],
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      }
    ]
  });
});

// ダッシュボードデータAPI
app.get('/api/v1/analytics/team', (req, res) => {
  res.json({
    teamPerformance: {
      overallScore: 85,
      memberCount: 5,
      averageRating: 4.5,
      elementalDistribution: {
        '木': 2,
        '火': 1,
        '土': 0,
        '金': 1,
        '水': 1
      }
    },
    recentActivity: [
      {
        date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
        eventCount: 5,
        userCount: 3
      },
      {
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        eventCount: 8,
        userCount: 4
      },
      {
        date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        eventCount: 6,
        userCount: 3
      }
    ]
  });
});

// フォローアップレコメンデーションAPI
app.get('/api/v1/analytics/follow-up-recommendations', (req, res) => {
  res.json([
    {
      userId: 'user-1',
      userName: '山田太郎',
      lastVisit: new Date(Date.now() - 30 * 86400000).toISOString(),
      reason: '3週間以上来店なし',
      recommendedAction: 'メールでフォローアップ',
      element: '木',
      yinYang: '陽',
      priority: 'high'
    },
    {
      userId: 'user-2',
      userName: '佐藤花子',
      lastVisit: new Date(Date.now() - 14 * 86400000).toISOString(),
      reason: 'サービス評価が低下',
      recommendedAction: '電話でフォローアップ',
      element: '火',
      yinYang: '陰',
      priority: 'medium'
    }
  ]);
});

// 404エラーハンドリング - すべてのルートの後に追加
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'リソースが見つかりません',
    path: req.path
  });
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});