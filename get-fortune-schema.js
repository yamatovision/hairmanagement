require('dotenv').config({ path: './backend/.env' });
const { MongoClient } = require('mongodb');

async function getFortuneSchema() {
  let client;
  try {
    // MongoDBに直接接続
    client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('MongoDB接続成功');
    
    const db = client.db('patrolmanagement');
    const collection = db.collection('fortunes');
    
    // 最新の運勢データを1件取得
    const fortune = await collection.findOne({}, { sort: { createdAt: -1 } });
    
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
      console.log(JSON.stringify(fortune, null, 2));
      
      // aiGeneratedAdviceの型を確認
      if (fortune.aiGeneratedAdvice) {
        console.log('\n--- aiGeneratedAdvice の型情報 ---');
        console.log('Type:', typeof fortune.aiGeneratedAdvice);
        console.log('isObject:', fortune.aiGeneratedAdvice !== null && typeof fortune.aiGeneratedAdvice === 'object');
        console.log('isArray:', Array.isArray(fortune.aiGeneratedAdvice));
        console.log('Keys:', Object.keys(fortune.aiGeneratedAdvice));
      }
    } else {
      console.log('運勢データが見つかりません');
    }
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    // 接続を閉じる
    await client.close();
    console.log('データベース接続を閉じました');
  }
}

getFortuneSchema();
