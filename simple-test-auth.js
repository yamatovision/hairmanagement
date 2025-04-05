/**
 * 認証エンドポイントの簡易テスト
 */
const axios = require('axios');

async function testAuth() {
  // 127.0.0.1を使用（localhostではなく）
  const baseUrl = 'http://127.0.0.1:5001/api/v1';
  const testUser = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  try {
    console.log('認証APIの簡易テストを実行します');
    console.log(`ベースURL: ${baseUrl}`);
    
    // 1. ヘルスチェック
    try {
      console.log('ヘルスチェック中...');
      const healthResponse = await axios.get(`${baseUrl}/health`);
      console.log(`ヘルスチェック結果: ${healthResponse.status} ${JSON.stringify(healthResponse.data)}`);
    } catch (error) {
      console.error('ヘルスチェックエラー:', error.message);
      // エラーでも続行
    }

    // 2. ログインを試行
    console.log(`ログインを試行中... (${testUser.email})`);
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, testUser);
    
    console.log('ログインレスポンス:', JSON.stringify(loginResponse.data, null, 2));
    
    let token;
    if (loginResponse.status === 200) {
      // レスポンス構造に応じてトークンを取得
      if (loginResponse.data.token) {
        token = loginResponse.data.token;
      } else if (loginResponse.data.data && loginResponse.data.data.token) {
        token = loginResponse.data.data.token;
      }
      
      if (token) {
        console.log('✅ ログイン成功!');
        console.log(`トークン: ${token.substring(0, 15)}...`);
        
        // 3. ユーザー情報の取得
        console.log('ユーザー情報取得中...');
        const userResponse = await axios.get(`${baseUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ ユーザー情報取得成功!');
        console.log('ユーザー情報:', JSON.stringify(userResponse.data, null, 2));
        
        // 4. ログアウト
        console.log('ログアウト中...');
        const logoutResponse = await axios.post(`${baseUrl}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`ログアウト結果: ${logoutResponse.status}`);
        
      } else {
        console.log('❌ トークンが見つかりません');
        console.log(loginResponse.data);
      }
    } else {
      console.log('❌ ログイン失敗');
      console.log(loginResponse.data);
    }
    
  } catch (error) {
    console.error('テスト実行エラー:', error.message);
    if (error.response) {
      console.error('レスポンスデータ:', error.response.data);
      console.error('ステータスコード:', error.response.status);
    }
  }
}

testAuth();