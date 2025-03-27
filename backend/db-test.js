const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function testDBConnection() {
  try {
    console.log('MongoDB URI:', process.env.DB_URI);
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB接続成功!');
    
    // コレクション一覧を取得
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('データベース内のコレクション:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // usersコレクションのドキュメント数を確認
    if (collections.some(c => c.name === 'users')) {
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log(`usersコレクション内のドキュメント数: ${userCount}`);
      
      // サンプルユーザーを取得
      const sampleUsers = await mongoose.connection.db.collection('users').find().limit(2).toArray();
      console.log('サンプルユーザー:');
      sampleUsers.forEach(user => {
        console.log(`- ID: ${user._id}, メール: ${user.email}, 名前: ${user.name}`);
      });
    }
    
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB接続を終了しました');
  }
}

testDBConnection();