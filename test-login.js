/**
 * 認証フロー検証テスト
 * MongoDBに接続してログイン認証フローをテストするスクリプト
 */

// ES Modules形式に変更
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数の読み込み
dotenv.config();

// コマンドライン引数を解析
const args = process.argv.slice(2);
const skipBackendTests = args.includes('--skip-backend');

// 設定
const API_URL = process.env.API_URL || 'http://localhost:5000';
const ADMIN_EMAIL = 'kazutofukushima1202@gmail.com'; // 既に作成済みの管理者アカウント
const ADMIN_PASSWORD = 'aikakumei';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/patrolmanagement';

// テスト関数
async function testAuthFlow() {
  console.log('--- 認証フロー検証テスト開始 ---');

  // MongoDB接続テスト
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB接続成功');
    
    // データベース内のユーザーコレクションを確認
    const userCount = await mongoose.connection.collection('users').countDocuments();
    console.log(`ℹ️ ユーザーコレクション内のドキュメント数: ${userCount}`);
    
    // 管理者ユーザーが存在するか確認
    const adminUser = await mongoose.connection.collection('users').findOne({ email: ADMIN_EMAIL });
    if (adminUser) {
      console.log(`✅ 管理者ユーザーが存在します: ${ADMIN_EMAIL}`);
      console.log(`ℹ️ ユーザー名: ${adminUser.name}`);
      console.log(`ℹ️ ユーザーロール: ${adminUser.role}`);
    } else {
      console.log(`❌ 管理者ユーザーが見つかりません: ${ADMIN_EMAIL}`);
      console.log('管理者ユーザーを作成する必要があります。');
      await mongoose.disconnect();
      return;
    }
    
  } catch (error) {
    console.error('❌ MongoDB接続エラー:', error.message);
    return;
  }

  // バックエンドAPIテストをスキップするかどうか
  if (skipBackendTests) {
    console.log('⏭️ バックエンドAPIテストをスキップします');
    console.log('--- 認証フロー検証テスト完了 ---');
    await mongoose.disconnect();
    console.log('MongoDB接続を閉じました');
    return;
  }

  // バックエンドAPIテスト
  console.log('\n🧪 バックエンドAPIテストを開始します...');
  
  // ログインテスト
  try {
    console.log(`🔑 管理者アカウント (${ADMIN_EMAIL}) でログイン試行...`);
    
    const loginResponse = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }),
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ ログイン失敗:', loginData.message || 'ログイン中にエラーが発生しました');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ ログイン成功');
    console.log(`ℹ️ ユーザー名: ${loginData.data.user.name}`);
    console.log(`ℹ️ ユーザーロール: ${loginData.data.user.role}`);
    
    // トークンの取得
    const token = loginData.data.token;
    if (!token) {
      console.error('❌ トークンが見つかりません');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ アクセストークン取得成功');
    
    // 認証が必要なリソース（ユーザー情報）へのアクセスをテスト
    const userResponse = await fetch(`${API_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!userResponse.ok) {
      const userData = await userResponse.json();
      console.error('❌ ユーザー情報取得失敗:', userData.message || 'ユーザー情報取得中にエラーが発生しました');
      await mongoose.disconnect();
      return;
    }
    
    const userData = await userResponse.json();
    console.log('✅ 認証済みリソースへのアクセス成功');
    console.log(`ℹ️ 取得されたユーザー: ${userData.data.name} (${userData.data.email})`);
    
    // トークン検証テスト（無効なトークンでアクセス）
    const invalidTokenResponse = await fetch(`${API_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    if (invalidTokenResponse.status === 401) {
      console.log('✅ 無効なトークン検証成功（アクセス拒否）');
    } else {
      console.error('❌ 無効なトークン検証失敗（アクセスが許可されました）');
    }
    
    // ログアウトテスト
    const logoutResponse = await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const logoutData = await logoutResponse.json();
    
    if (!logoutResponse.ok) {
      console.error('❌ ログアウト失敗:', logoutData.message || 'ログアウト中にエラーが発生しました');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ ログアウト成功');
    
    console.log('--- 認証フロー検証テスト完了 ---');
    console.log('🎉 すべてのテストに成功しました！');
    
  } catch (error) {
    console.error('❌ テスト実行中にエラーが発生しました:', error.message);
    console.log('\n⚠️ バックエンドサーバーが起動していることを確認してください。');
    console.log('バックエンドサーバーを起動するには：');
    console.log('  cd backend && npm run dev');
    console.log('\nまたは両方のサーバーを起動するには：');
    console.log('  ./start-dev.sh');
  } finally {
    // MongoDBの接続を閉じる
    await mongoose.disconnect();
    console.log('MongoDB接続を閉じました');
  }
}

// テストの実行
testAuthFlow().catch(error => {
  console.error('予期しないエラーが発生しました:', error);
});