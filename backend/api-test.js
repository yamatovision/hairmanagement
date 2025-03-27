const axios = require('axios');

async function testLogin() {
  try {
    console.log('ログインテスト...');
    const response = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    console.log('ログイン成功!');
    console.log('レスポンス全体:', JSON.stringify(response.data, null, 2));
    
    // JWTトークンを解析してペイロードを確認
    let token = null;
    
    // 異なるレスポンス形式をチェック
    if (response.data.token) {
      token = response.data.token;
    } else if (response.data.data && response.data.data.token) {
      token = response.data.data.token;
    } else if (response.data.user && response.data.user.token) {
      token = response.data.user.token;
    }
    
    // JWTデコード
    if (token) {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('JWTペイロード:', payload);
      }
    }
                  
    console.log('抽出されたトークン:', token);
    return token;
  } catch (error) {
    console.error('ログインエラー:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function testUserAPI(token) {
  if (!token) return;
  
  // JWTペイロードからユーザーIDを取得
  let userId = null;
  const parts = token.split('.');
  if (parts.length === 3) {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    userId = payload.id;
  }
  
  try {
    // デバッグ情報の表示
    console.log('\nデバッグ情報:');
    console.log('ユーザーID:', userId);
    
    // 1. ユーザー情報取得を試みる（異なるエンドポイント）
    console.log('\n1. ユーザー情報取得テスト - 異なるエンドポイント');
    
    try {
      // 認証トークンを使ってユーザー情報を取得
      console.log('APIエンドポイント: /api/v1/users/me');
      console.log('使用する認証トークン:', token);
      const meResponse = await axios.get('http://localhost:5001/api/v1/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('ユーザー情報(me):', JSON.stringify(meResponse.data, null, 2));
    } catch (meError) {
      console.log('ユーザー情報(me)取得エラー:', meError.response ? meError.response.data : meError.message);
      
      // 別のエンドポイントを試す
      if (userId) {
        try {
          console.log(`\nAPIエンドポイント: /api/v1/users/${userId}`);
          const userResponse = await axios.get(`http://localhost:5000/api/v1/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('ユーザー情報(id):', JSON.stringify(userResponse.data, null, 2));
        } catch (userError) {
          console.log('ユーザー情報(id)取得エラー:', userError.response ? userError.response.data : userError.message);
        }
      }
    }
    
    // 2. 利用可能なAPIエンドポイントを確認
    console.log('\n2. 利用可能なAPIエンドポイントの確認');
    try {
      console.log('APIエンドポイント: /api/v1');
      const apiResponse = await axios.get('http://localhost:5001/api/v1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('APIエンドポイント応答:', JSON.stringify(apiResponse.data, null, 2));
    } catch (apiError) {
      console.log('APIエンドポイント確認エラー:', apiError.response ? apiError.response.data : apiError.message);
    }
    
    // 3. ヘルスチェック
    console.log('\n3. ヘルスチェック');
    try {
      console.log('APIエンドポイント: /api/v1/health');
      const healthResponse = await axios.get('http://localhost:5001/api/v1/health');
      console.log('ヘルスチェック応答:', JSON.stringify(healthResponse.data, null, 2));
    } catch (healthError) {
      console.log('ヘルスチェックエラー:', healthError.response ? healthError.response.data : healthError.message);
    }
  } catch (error) {
    console.error('テスト実行エラー:', error.message);
  }
}

async function run() {
  const token = await testLogin();
  if (token) {
    await testUserAPI(token);
  }
}

run();