/**
 * シンプルな認証テスト
 */
const axios = require('axios');
const dotenv = require('dotenv');

// 環境変数の読み込み
dotenv.config();

// APIのベースURL
const API_URL = process.env.API_URL || 'http://localhost:5001/api/v1';

// 認証情報
const testUser = {
  email: 'admin@example.com',
  password: 'admin123'
};

async function testAuth() {
  console.log('認証テスト開始...');
  
  try {
    console.log(`APIエンドポイント: ${API_URL}/auth/login`);
    
    // ログイン
    console.log('ログイン試行中...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, testUser);
    
    console.log('レスポンス構造:', JSON.stringify(loginResponse.data, null, 2).substring(0, 300) + '...');
    
    if (loginResponse.data && loginResponse.data.success) {
      console.log('✅ ログイン成功!');
      
      // レスポンス構造に基づいてトークンを取得
      const token = loginResponse.data.data.token;
      console.log(`トークン: ${token.substring(0, 20)}...`);
      
      // ユーザー情報取得
      console.log('\nユーザー情報取得試行中...');
      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (meResponse.data) {
        console.log('✅ ユーザー情報取得成功!');
        console.log('ユーザー情報:', JSON.stringify(meResponse.data, null, 2));
      }
      
      // ログアウト
      console.log('\nログアウト試行中...');
      const logoutResponse = await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (logoutResponse.data) {
        console.log('✅ ログアウト成功!');
      }
    } else {
      console.error('❌ ログイン失敗: 認証に失敗しました');
    }
  } catch (error) {
    console.error('❌ エラー発生:');
    if (error.response) {
      // サーバーからのレスポンスを受け取った場合
      console.error(`ステータスコード: ${error.response.status}`);
      console.error('レスポンスデータ:', error.response.data);
    } else if (error.request) {
      // リクエストは送信されたがレスポンスが受信されなかった場合
      console.error('サーバーからの応答がありません。サーバーが起動しているか確認してください。');
    } else {
      // リクエスト設定中にエラーが発生した場合
      console.error('リクエスト設定エラー:', error.message);
    }
  }
}

// テスト実行
testAuth();