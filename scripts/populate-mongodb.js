/**
 * 経営者ダッシュボード用の実データをMongoDBに投入するスクリプト
 * モックを削除して実データに切り替えるためのデータ初期化
 * 
 * 使用方法:
 * node scripts/populate-mongodb.js
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB 接続文字列
const MONGODB_URI = process.env.DB_URI || 'mongodb+srv://atlas-sample-dataset-load-67e3a5695c0c8c568c95566e:TPVusEQhZbpA63Wx@cluster0.cjam9ef.mongodb.net/patrolmanagement';

// データファイルのパス
const usersDataPath = path.join(__dirname, 'initial-data-users.json');
const analyticsDataPath = path.join(__dirname, 'initial-data-analytics.json');

// メイン関数
async function populateDatabase() {
  console.log(`MongoDB に接続中: ${MONGODB_URI}`);
  let client = null;

  try {
    // MongoDBに接続
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('MongoDB に接続しました');
    
    const db = client.db('patrolmanagement');
    
    // コレクションを取得
    const usersCollection = db.collection('users');
    const teamAnalyticsCollection = db.collection('teamanalytics');
    const engagementAnalyticsCollection = db.collection('engagementanalytics');
    
    // ユーザーデータの読み込みと挿入
    const usersData = JSON.parse(fs.readFileSync(usersDataPath, 'utf8'));
    
    if (usersData && usersData.length > 0) {
      // 既存のデータを削除
      await usersCollection.deleteMany({});
      console.log('既存のユーザーデータを削除しました');
      
      // 新しいデータを挿入
      const userResult = await usersCollection.insertMany(usersData);
      console.log(`${userResult.insertedCount}件のユーザーデータを挿入しました`);
      
      // ユーザーIDの配列を作成
      const userIds = Object.values(userResult.insertedIds).map(id => id.toString());
      
      // チーム分析データの読み込みと挿入
      const analyticsData = JSON.parse(fs.readFileSync(analyticsDataPath, 'utf8'));
      
      if (analyticsData && analyticsData.length > 0) {
        // followUpRecommendationsにユーザーIDを追加
        const analyticsWithUserIds = analyticsData.map(analytics => {
          // フォローアップ推奨を生成（各ユーザーに対して）
          analytics.followUpRecommendations = [
            // 高優先度ユーザー1名
            {
              userId: userIds[0],
              urgency: 'high',
              reason: '過去2週間で急激な満足度低下。技術習得と待遇について複数回の否定的発言あり。',
              suggestedApproach: '新しい技術トレーニングの機会について1対1でのミーティングを実施し、キャリアビジョンと待遇についての対話を行う。'
            },
            // 中優先度ユーザー2名
            {
              userId: userIds[1],
              urgency: 'medium',
              reason: '運勢確認頻度が低下中。対話内容からチーム内人間関係の悩みが検出されている。',
              suggestedApproach: '間接的にチーム活動への参加を促し、コミュニケーションの機会を増やす。必要に応じてメンター制度の活用を検討。'
            },
            {
              userId: userIds[2],
              urgency: 'medium',
              reason: 'スケジュール管理に関する課題が増加中。タイムマネジメントのサポートが必要。',
              suggestedApproach: '業務優先順位の設定方法についてアドバイスし、より効率的な時間管理を支援する。'
            },
            // 低優先度ユーザー2名
            {
              userId: userIds[3],
              urgency: 'low',
              reason: 'スキル成長に関する不安の兆候。自己評価が低く、キャリアパスの明確さを求めている。',
              suggestedApproach: '具体的なスキル向上計画を一緒に設定し、成功体験を増やす機会を提供。組織内での将来的なポジションについて対話を行う。'
            }
          ];
          return analytics;
        });
        
        // 既存のデータを削除
        await teamAnalyticsCollection.deleteMany({});
        console.log('既存のチーム分析データを削除しました');
        
        // 新しいデータを挿入
        const teamResult = await teamAnalyticsCollection.insertMany(analyticsWithUserIds);
        console.log(`${teamResult.insertedCount}件のチーム分析データを挿入しました`);
        
        // エンゲージメント分析データの生成と挿入
        // 既存のデータを削除
        await engagementAnalyticsCollection.deleteMany({});
        console.log('既存のエンゲージメント分析データを削除しました');
        
        // ユーザーごとのエンゲージメントデータを生成
        const engagementData = userIds.map(userId => {
          return {
            userId: userId,
            period: {
              startDate: new Date("2025-02-27T00:00:00.000Z"),
              endDate: new Date("2025-03-27T00:00:00.000Z")
            },
            metrics: {
              appUsage: {
                dailyFortuneViews: Math.floor(Math.random() * 25) + 5,
                conversationCount: Math.floor(Math.random() * 30) + 10,
                averageConversationLength: Math.floor(Math.random() * 12) + 3,
                responseRate: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2))
              },
              sentiment: {
                average: parseFloat((Math.random() * 1.4 - 0.4).toFixed(2)),
                trend: ['improving', 'stable', 'declining', 'fluctuating'][Math.floor(Math.random() * 4)],
                topPositiveTopics: ['チーム協力', 'スキル向上', '技術習得', '顧客満足', 'サロン環境']
                  .sort(() => 0.5 - Math.random())
                  .slice(0, Math.floor(Math.random() * 3) + 1),
                topNegativeTopics: ['スケジュール管理', '業務量', '待遇', 'コミュニケーション', 'ストレス']
                  .sort(() => 0.5 - Math.random())
                  .slice(0, Math.floor(Math.random() * 3))
              },
              goals: {
                active: Math.floor(Math.random() * 4) + 1,
                completed: Math.floor(Math.random() * 8) + 2,
                progressRate: parseFloat((Math.random() * 0.6 + 0.2).toFixed(2))
              },
              teamEngagement: {
                contributionCount: Math.floor(Math.random() * 9) + 1,
                mentorshipActivity: Math.floor(Math.random() * 5),
                peerRecognition: Math.floor(Math.random() * 8)
              }
            },
            createdAt: new Date("2025-03-27T00:00:00.000Z"),
            updatedAt: new Date("2025-03-27T00:00:00.000Z")
          };
        });
        
        // データを挿入
        const engagementResult = await engagementAnalyticsCollection.insertMany(engagementData);
        console.log(`${engagementResult.insertedCount}件のエンゲージメント分析データを挿入しました`);
      }
    } else {
      console.log('ユーザーデータが見つからないか、空です');
    }
    
    console.log('データベースへのデータ投入が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    // クライアントを閉じる
    if (client) {
      await client.close();
      console.log('MongoDB 接続を閉じました');
    }
  }
}

// スクリプトの実行
populateDatabase().catch(console.error);