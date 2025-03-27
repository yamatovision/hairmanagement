/**
 * 有効なユーザーIDを取得するスクリプト
 * 
 * 使用方法:
 * node scripts/get-valid-user-id.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function getValidUserId() {
  try {
    // MongoDB接続
    const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';
    console.log(`MongoDB に接続中: ${dbUri}`);
    await mongoose.connect(dbUri);
    console.log('MongoDB に接続しました');
    
    // データベースからユーザーを取得
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // ユーザー一覧を取得
    const users = await usersCollection.find({}).toArray();
    
    if (users.length === 0) {
      console.log('ユーザーが見つかりませんでした');
      return null;
    }
    
    // ユーザー情報を表示
    console.log('登録されているユーザー:');
    users.forEach((user, index) => {
      console.log(`[${index}] ID: ${user._id.toString()}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // 最初のユーザーIDを返す
    return users[0]._id.toString();
  } catch (error) {
    console.error('エラーが発生しました:', error);
    return null;
  } finally {
    // 接続を閉じる
    await mongoose.disconnect();
    console.log('MongoDB 接続を閉じました');
  }
}

// スクリプト実行
getValidUserId()
  .then(userId => {
    if (userId) {
      console.log('\n有効なユーザーID:', userId);
      console.log('\nテストスクリプトでこのIDを使用してください。');
    } else {
      console.log('有効なユーザーIDが取得できませんでした。データベースを確認してください。');
    }
  })
  .catch(error => {
    console.error('スクリプト実行中にエラーが発生しました:', error);
  });