/**
 * 認証トークンをデコードして内容を表示するスクリプト
 * 
 * 使用方法: node decode-auth-token.js <JWT_TOKEN>
 */

const jwt = require('jsonwebtoken');
const fs = require('fs');

// 環境変数を読み込む
require('dotenv').config();

// コマンドライン引数からトークンを取得
const token = process.argv[2];

if (!token) {
  console.log('使用方法: node decode-auth-token.js <JWT_TOKEN>');
  process.exit(1);
}

console.log('===== JWT トークン内容デコーダー =====');
console.log(`トークン: ${token.substring(0, 15)}...`);

try {
  // トークンをデコード（検証なし）
  const decodedToken = jwt.decode(token, { complete: true });
  
  if (!decodedToken) {
    console.log('無効なトークン形式です');
    process.exit(1);
  }
  
  // ヘッダー情報
  console.log('\n=== ヘッダー情報 ===');
  console.log(JSON.stringify(decodedToken.header, null, 2));
  
  // ペイロード情報
  console.log('\n=== ペイロード情報 ===');
  console.log(JSON.stringify(decodedToken.payload, null, 2));
  
  // ユーザーID
  if (decodedToken.payload.userId) {
    console.log(`\nユーザーID: ${decodedToken.payload.userId}`);
    console.log(`このIDはデータベース内に存在する必要があります`);
  } else {
    console.log('\nユーザーIDが見つかりません');
  }
  
  // 有効期限
  if (decodedToken.payload.exp) {
    const expDate = new Date(decodedToken.payload.exp * 1000);
    console.log(`\n有効期限: ${expDate.toISOString()}`);
    
    // 有効期限の確認
    const now = new Date();
    if (expDate > now) {
      console.log(`トークンは有効です（あと${Math.round((expDate - now) / 1000 / 60)}分）`);
    } else {
      console.log(`トークンは期限切れです（${Math.round((now - expDate) / 1000 / 60)}分前に期限切れ）`);
    }
  }
  
  // トークン検証を試みる
  const JWT_SECRET = process.env.JWT_SECRET;
  if (JWT_SECRET) {
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      console.log('\n=== トークン検証結果 ===');
      console.log('✅ トークンは有効で正しい署名です');
    } catch (verifyError) {
      console.log('\n=== トークン検証結果 ===');
      console.log(`❌ トークン検証エラー: ${verifyError.message}`);
    }
  } else {
    console.log('\n環境変数JWT_SECRETが設定されていないため、トークン検証はスキップしました');
  }
  
  // 問題の検証
  if (decodedToken.payload.userId === '67e487dbc4a58a62d38ac6ac') {
    console.log('\n⚠️ 問題のIDが検出されました!');
    console.log('このIDはデータベースに存在しないユーザーIDです。');
    console.log('解決策: トークン生成処理でのIDマッピングを修正するか、このIDを持つユーザーを作成する必要があります。');
  } else if (decodedToken.payload.userId === '67e52f32fb1b7bc2b73744ce') {
    console.log('\n✅ 正しいユーザーIDが使用されています');
    console.log('このIDは実際にデータベースに存在するユーザーIDです。');
  }
  
} catch (error) {
  console.error('トークン解析エラー:', error.message);
  process.exit(1);
}