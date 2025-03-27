/**
 * 経営者ダッシュボード用のテストデータを MongoDB に投入するスクリプト
 * 
 * 使用方法:
 * node scripts/seed-analytics-data.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数の読み込み
dotenv.config();

// MongoDB 接続文字列
const MONGODB_URI = process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';

// ユーザーIDを保持する配列
const userIds = [];

// ランダムな日付を生成（startDate から endDate の間）
function randomDate(startDate, endDate) {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

// ランダムな要素を配列から選択
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ランダムな整数を min から max の間で生成
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ランダムな小数を min から max の間で生成し、小数点以下 decimals 桁に丸める
function randomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

// ユーザーのテストデータを生成
async function seedUsers(db) {
  console.log('ユーザーのテストデータを生成中...');
  
  const firstNames = ['田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '山本', '中村', '小林', '加藤'];
  const lastNames = ['健太', '優子', '大輔', '美咲', '隆', '恵', '太郎', '花子', '翔', '愛'];
  const roles = ['employee', 'employee', 'employee', 'employee', 'manager', 'admin']; // 従業員が多めに
  const elements = ['木', '火', '土', '金', '水']; // 五行要素
  
  const usersCollection = db.collection('users');
  
  // 既存のユーザーを確認
  const existingUsers = await usersCollection.countDocuments();
  if (existingUsers > 0) {
    console.log(`既存のユーザーが ${existingUsers} 人見つかりました。新規作成をスキップします。`);
    const users = await usersCollection.find({}).toArray();
    users.forEach(user => userIds.push(user._id.toString()));
    return;
  }
  
  // 10人のユーザーを作成
  const users = [];
  
  for (let i = 0; i < 10; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const role = randomElement(roles);
    const mainElement = randomElement(elements);
    
    // セカンダリー要素はメイン要素と異なるもの（50%の確率で設定）
    let secondaryElement = null;
    if (Math.random() > 0.5) {
      do {
        secondaryElement = randomElement(elements);
      } while (secondaryElement === mainElement);
    }
    
    const userId = new mongoose.Types.ObjectId();
    userIds.push(userId.toString());
    
    const user = {
      _id: userId,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGG6..juGdLu6icC1WhxmS', // "password123" のハッシュ
      birthDate: randomDate(new Date('1980-01-01'), new Date('2000-12-31')).toISOString().split('T')[0],
      role: role,
      elementalType: {
        mainElement: mainElement,
        secondaryElement: secondaryElement,
        yin: Math.random() > 0.5, // 陰陽をランダムに設定
      },
      notificationSettings: {
        dailyFortune: true,
        promptQuestions: true,
        teamEvents: true,
        goalReminders: role !== 'employee', // 管理者はリマインダーを有効化
        systemUpdates: role === 'admin', // 管理者はシステム更新通知を有効化
      },
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(user);
  }
  
  // データベースに一括挿入
  await usersCollection.insertMany(users);
  console.log(`${users.length} 人のユーザーを作成しました`);
}

// エンゲージメント分析のテストデータを生成
async function seedEngagementAnalytics(db) {
  console.log('エンゲージメント分析のテストデータを生成中...');
  
  const analyticsCollection = db.collection('engagementanalytics');
  
  // 既存のデータを確認
  const existingData = await analyticsCollection.countDocuments();
  if (existingData > 0) {
    console.log(`既存のエンゲージメント分析データが ${existingData} 件見つかりました。新規作成をスキップします。`);
    return;
  }
  
  const analytics = [];
  const trends = ['improving', 'stable', 'declining', 'fluctuating'];
  const positiveTopics = ['チーム協力', 'スキル向上', '技術習得', '顧客満足', 'サロン環境'];
  const negativeTopics = ['スケジュール管理', '業務量', '待遇', 'コミュニケーション', 'ストレス'];
  
  // 全てのユーザーに対してデータを作成
  for (const userId of userIds) {
    // 過去30日分のデータを作成
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const engagementAnalytics = {
      _id: new mongoose.Types.ObjectId(),
      userId: userId,
      period: {
        startDate: startDate,
        endDate: endDate,
      },
      metrics: {
        appUsage: {
          dailyFortuneViews: randomInt(5, 30),
          conversationCount: randomInt(10, 40),
          averageConversationLength: randomInt(3, 15),
          responseRate: randomFloat(0.6, 1.0),
        },
        sentiment: {
          average: randomFloat(-0.4, 1.0),
          trend: randomElement(trends),
          topPositiveTopics: Array.from(
            { length: randomInt(1, 3) },
            () => randomElement(positiveTopics)
          ),
          topNegativeTopics: Array.from(
            { length: randomInt(0, 3) },
            () => randomElement(negativeTopics)
          ),
        },
        goals: {
          active: randomInt(1, 5),
          completed: randomInt(2, 10),
          progressRate: randomFloat(0.2, 0.8),
        },
        teamEngagement: {
          contributionCount: randomInt(1, 10),
          mentorshipActivity: randomInt(0, 5),
          peerRecognition: randomInt(0, 8),
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    analytics.push(engagementAnalytics);
  }
  
  // データベースに一括挿入
  await analyticsCollection.insertMany(analytics);
  console.log(`${analytics.length} 件のエンゲージメント分析データを作成しました`);
}

// チーム分析のテストデータを生成
async function seedTeamAnalytics(db) {
  console.log('チーム分析のテストデータを生成中...');
  
  const teamAnalyticsCollection = db.collection('teamanalytics');
  
  // 既存のデータを確認
  const existingData = await teamAnalyticsCollection.countDocuments();
  if (existingData > 0) {
    console.log(`既存のチーム分析データが ${existingData} 件見つかりました。新規作成をスキップします。`);
    return;
  }
  
  // 過去30日分のデータを作成
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  // それぞれの重要度で1-3名のユーザーを選択
  const highUrgencyUsers = userIds.slice(0, randomInt(1, 3));
  const mediumUrgencyUsers = userIds.slice(3, 3 + randomInt(1, 3));
  const lowUrgencyUsers = userIds.slice(6, 6 + randomInt(1, 3));
  
  // フォローアップ推奨を生成
  const followUpRecommendations = [
    // 高優先度ユーザー
    ...highUrgencyUsers.map(userId => ({
      userId: userId,
      urgency: 'high',
      reason: '過去2週間で急激な満足度低下。技術習得と待遇について複数回の否定的発言あり。',
      suggestedApproach: '新しい技術トレーニングの機会について1対1でのミーティングを実施し、キャリアビジョンと待遇についての対話を行う。',
    })),
    
    // 中優先度ユーザー
    ...mediumUrgencyUsers.map(userId => ({
      userId: userId,
      urgency: 'medium',
      reason: '運勢確認頻度が低下中。対話内容からチーム内人間関係の悩みが検出されている。',
      suggestedApproach: '間接的にチーム活動への参加を促し、コミュニケーションの機会を増やす。必要に応じてメンター制度の活用を検討。',
    })),
    
    // 低優先度ユーザー
    ...lowUrgencyUsers.map(userId => ({
      userId: userId,
      urgency: 'low',
      reason: 'スキル成長に関する不安の兆候。自己評価が低く、キャリアパスの明確さを求めている。',
      suggestedApproach: '具体的なスキル向上計画を一緒に設定し、成功体験を増やす機会を提供。組織内での将来的なポジションについて対話を行う。',
    })),
  ];
  
  const teamAnalytics = {
    _id: new mongoose.Types.ObjectId(),
    period: {
      startDate: startDate,
      endDate: endDate,
    },
    overallEngagement: randomInt(70, 100),
    responseRate: randomInt(75, 100),
    sentimentDistribution: {
      positive: randomInt(50, 70),
      neutral: randomInt(20, 40),
      negative: randomInt(5, 15),
    },
    topConcerns: [
      {
        topic: '業務量と時間管理',
        frequency: randomInt(15, 25),
        averageSentiment: randomFloat(-0.8, -0.2),
      },
      {
        topic: 'キャリア成長の機会',
        frequency: randomInt(12, 22),
        averageSentiment: randomFloat(-0.6, -0.1),
      },
      {
        topic: '技術向上のサポート',
        frequency: randomInt(10, 18),
        averageSentiment: randomFloat(-0.5, -0.1),
      },
    ],
    topStrengths: [
      {
        topic: 'チームの雰囲気',
        frequency: randomInt(20, 30),
        averageSentiment: randomFloat(0.5, 1.0),
      },
      {
        topic: '顧客満足度',
        frequency: randomInt(18, 28),
        averageSentiment: randomFloat(0.4, 1.0),
      },
      {
        topic: 'サロン環境',
        frequency: randomInt(15, 25),
        averageSentiment: randomFloat(0.3, 1.0),
      },
    ],
    followUpRecommendations: followUpRecommendations,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // データベースに挿入
  await teamAnalyticsCollection.insertOne(teamAnalytics);
  console.log('チーム分析データを作成しました');
}

// メイン関数
async function seedDatabase() {
  console.log(`MongoDB に接続中: ${MONGODB_URI}`);
  let client;
  
  try {
    // MongoDB に接続
    client = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB に接続しました');
    const db = mongoose.connection.db;
    
    // データの投入
    await seedUsers(db);
    await seedEngagementAnalytics(db);
    await seedTeamAnalytics(db);
    
    console.log('テストデータの投入が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    // 接続を閉じる
    if (client) {
      await mongoose.disconnect();
      console.log('MongoDB 接続を閉じました');
    }
  }
}

// スクリプトの実行
seedDatabase().catch(console.error);