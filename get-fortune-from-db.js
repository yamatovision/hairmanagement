require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
require('./backend/dist/domain/models/fortune.model');

async function getFortune() {
  try {
    // データベース接続
    await mongoose.connect('mongodb://localhost:27017/patrolmanagement');
    console.log('データベース接続成功');
    
    // Fortuneモデルを取得
    const Fortune = mongoose.model('Fortune');
    
    // 最新の運勢データを1件取得
    const fortune = await Fortune.findOne({}).sort({ createdAt: -1 });
    
    if (fortune) {
      console.log('=== 最新の運勢データ ===');
      console.log('ID:', fortune._id);
      console.log('userId:', fortune.userId);
      console.log('date:', fortune.date);
      console.log('aiGeneratedAdvice:', fortune.aiGeneratedAdvice ? '存在します' : '存在しません');
      
      // aiGeneratedAdviceが存在する場合は詳細を表示
      if (fortune.aiGeneratedAdvice) {
        console.log('\n--- aiGeneratedAdvice 詳細 ---');
        console.log(JSON.stringify(fortune.aiGeneratedAdvice, null, 2));
      }
      
      // 全データを表示
      console.log('\n--- 完全な運勢データ ---');
      console.log(JSON.stringify(fortune.toObject(), null, 2));
    } else {
      console.log('運勢データが見つかりません');
    }
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    // 接続を閉じる
    await mongoose.disconnect();
    console.log('データベース接続を閉じました');
  }
}

getFortune();
