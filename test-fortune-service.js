/**
 * DailyFortuneServiceの直接テスト用スクリプト
 * 運勢データの更新とAIレスポンスのパースを確認します
 */
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const { container } = require('./backend/src/infrastructure/di/container');
require('./backend/src/domain/models/fortune.model');
require('./backend/src/domain/models/user.model');

// DailyFortuneServiceのインスタンスをテスト
async function testDailyFortuneService() {
  console.log('=== DailyFortuneServiceのテスト ===');
  
  try {
    // 環境変数の確認
    const apiKey = process.env.CLAUDE_API_KEY || 'not-set';
    console.log('CLAUDE_API_KEY:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));
    console.log('CLAUDE_API_URL:', process.env.CLAUDE_API_URL);
    
    // データベース接続
    await connectToDatabase();
    
    // テスト用のユーザーIDを取得
    const userIds = await getUserIds();
    if (userIds.length === 0) {
      console.error('テスト用のユーザーが見つかりません');
      return;
    }
    const testUserId = userIds[0];
    console.log('テスト対象ユーザーID:', testUserId);
    
    // サービスの取得
    const dailyFortuneService = container.resolve('DailyFortuneService');
    console.log('DailyFortuneServiceが正常に解決されました');
    
    // 既存の運勢データを削除してテスト
    await deleteExistingFortune(testUserId);
    
    // 新しい運勢データを生成
    console.log('新しい運勢データを生成します...');
    const fortune = await dailyFortuneService.getDailyFortune(testUserId);
    
    // 結果を表示
    console.log('\n=== 生成された運勢データ ===');
    console.log('date:', fortune.date);
    console.log('overallScore:', fortune.overallScore);
    console.log('aiGeneratedAdvice:', fortune.aiGeneratedAdvice ? 'あり' : 'なし');
    
    if (fortune.aiGeneratedAdvice) {
      console.log('\n--- AIGeneratedAdvice詳細 ---');
      console.log('summary:', fortune.aiGeneratedAdvice.summary.substring(0, 50) + '...');
      console.log('personalAdvice:', fortune.aiGeneratedAdvice.personalAdvice.substring(0, 50) + '...');
      console.log('teamAdvice:', fortune.aiGeneratedAdvice.teamAdvice.substring(0, 50) + '...');
      
      if (fortune.aiGeneratedAdvice.luckyPoints) {
        console.log('luckyPoints:');
        console.log('  color:', fortune.aiGeneratedAdvice.luckyPoints.color);
        console.log('  items:', fortune.aiGeneratedAdvice.luckyPoints.items);
        console.log('  number:', fortune.aiGeneratedAdvice.luckyPoints.number);
        console.log('  action:', fortune.aiGeneratedAdvice.luckyPoints.action);
      } else {
        console.log('luckyPoints: なし');
      }
    }
    
    console.log('\nテスト結果: 成功 ✅ 運勢データが正常に生成されました');
  } catch (error) {
    console.error('エラー: DailyFortuneServiceのテスト中にエラーが発生しました');
    console.error('エラーメッセージ:', error.message);
    console.error('スタックトレース:', error.stack);
    console.log('テスト結果: 失敗 ❌');
  } finally {
    // データベース接続を閉じる
    setTimeout(() => {
      mongoose.disconnect().then(() => {
        console.log('データベース接続を閉じました');
        process.exit(0);
      });
    }, 1000);
  }
}

// データベースに接続
async function connectToDatabase() {
  console.log('データベースに接続中...');
  const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/patrolmanagement';
  
  await mongoose.connect(dbUrl);
  console.log('データベース接続成功');
  return mongoose.connection;
}

// テスト用のユーザーIDを取得
async function getUserIds() {
  const User = mongoose.model('User');
  const users = await User.find({}).limit(5);
  return users.map(user => user._id.toString());
}

// 既存の運勢データを削除
async function deleteExistingFortune(userId) {
  console.log('既存の運勢データを削除中...');
  const Fortune = mongoose.model('Fortune');
  
  // 今日の日付を取得
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 今日の運勢データを削除
  const result = await Fortune.deleteOne({ 
    userId: userId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });
  
  console.log(`${result.deletedCount}件の運勢データを削除しました`);
}

// ダミーのAIレスポンスを生成
function createDummyAIResponse() {
  return {
    summary: "あなたは今日、清々しい風が吹き抜ける森のような運気です。新しいアイデアが自然と湧き上がり、周囲との調和も取れやすい一日となるでしょう。",
    personalAdvice: "AIプロダクトの開発において、今日は特に「ユーザー体験」に焦点を当てると良いでしょう。",
    teamAdvice: "バイアウト目標達成のためには、今日は特に情報の共有と透明性を高めることが重要です。",
    luckyPoints: {
      color: "緑",
      items: ["観葉植物", "木製のアクセサリー"],
      number: 3,
      action: "朝日を浴びながら深呼吸する"
    }
  };
}

// テスト実行
testDailyFortuneService();