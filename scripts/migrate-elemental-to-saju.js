/**
 * 既存のelementalTypeデータをsajuProfileに移行するスクリプト
 * 
 * 実行方法:
 * node scripts/migrate-elemental-to-saju.js
 * 
 * 作成日: 2025/04/05
 */

// データベース接続と必要なモデルのインポート
require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// データベース接続情報
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/patrolmanagement';

// 実行関数
async function migrateElementalToSaju() {
  try {
    console.log('データベースに接続中...');
    await mongoose.connect(MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });
    console.log('接続成功。マイグレーションを開始します...');
    
    // MongoClientを使用して直接コレクションにアクセス
    const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // elementalTypeを持つが、sajuProfileの主要属性が欠けているユーザーを取得
    console.log('マイグレーション対象のユーザーを検索中...');
    const users = await usersCollection.find({
      'elementalType': { $exists: true },
      $or: [
        { 'sajuProfile.mainElement': { $exists: false } },
        { 'sajuProfile.yinYang': { $exists: false } }
      ]
    }).toArray();
    
    console.log(`${users.length}人のユーザーが対象です`);
    
    if (users.length === 0) {
      console.log('マイグレーションの必要があるユーザーは見つかりませんでした。');
      await client.close();
      process.exit(0);
    }
    
    // 各ユーザーのelementalTypeデータをsajuProfileに移行
    console.log('マイグレーション処理を実行中...');
    let migratedCount = 0;
    
    for (const user of users) {
      if (!user.elementalType) {
        console.log(`ユーザーID ${user._id} には elementalType が設定されていません`);
        continue;
      }
      
      // sajuProfileが存在しない場合は作成
      if (!user.sajuProfile) {
        user.sajuProfile = {};
      }
      
      // elementalTypeの主要属性をsajuProfileにコピー
      if (user.elementalType.mainElement && !user.sajuProfile.mainElement) {
        user.sajuProfile.mainElement = user.elementalType.mainElement;
      }
      
      if (user.elementalType.secondaryElement && !user.sajuProfile.secondaryElement) {
        user.sajuProfile.secondaryElement = user.elementalType.secondaryElement;
      }
      
      if (user.elementalType.yinYang && !user.sajuProfile.yinYang) {
        user.sajuProfile.yinYang = user.elementalType.yinYang;
      }
      
      // 更新を実行
      try {
        const result = await usersCollection.updateOne(
          { _id: user._id },
          { $set: { sajuProfile: user.sajuProfile } }
        );
        
        if (result.modifiedCount > 0) {
          migratedCount++;
          console.log(`ユーザーID ${user._id} の情報を更新しました`);
        }
      } catch (updateError) {
        console.error(`ユーザーID ${user._id} の更新中にエラーが発生しました:`, updateError);
      }
    }
    
    console.log(`マイグレーション完了: ${migratedCount}/${users.length} 件のユーザー情報を更新しました`);
    
    // 検証: マイグレーション後の状態を確認
    const remainingUsers = await usersCollection.find({
      'elementalType': { $exists: true },
      $or: [
        { 'sajuProfile.mainElement': { $exists: false } },
        { 'sajuProfile.yinYang': { $exists: false } }
      ]
    }).count();
    
    console.log(`未処理のユーザー数: ${remainingUsers}`);
    
    // 接続を閉じる
    await client.close();
    console.log('データベース接続を閉じました');
    
  } catch (error) {
    console.error('マイグレーション中にエラーが発生しました:', error);
  } finally {
    await mongoose.disconnect();
    console.log('マイグレーション処理を終了します');
  }
}

// スクリプトの実行
migrateElementalToSaju().catch(console.error);