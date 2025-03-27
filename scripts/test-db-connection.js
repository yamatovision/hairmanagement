require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';
    console.log(`MongoDB URIに接続中: ${dbUri}`);
    
    await mongoose.connect(dbUri);
    
    console.log('MongoDB接続成功！');
    console.log('データベース名:', mongoose.connection.db.databaseName);
    
    // コレクション一覧を取得
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('コレクション一覧:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    await mongoose.disconnect();
    console.log('MongoDB接続を終了しました。');
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    process.exit(1);
  }
};

connectDB();