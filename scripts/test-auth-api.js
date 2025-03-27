/**
 * シンプルな認証APIテスト
 * 個別に実行することを前提として作成されたテストスクリプト
 */
require('dotenv').config();
const http = require('http');

// APIの設定
const host = 'localhost';
const port = 5000;
const apiPrefix = '/api/v1';

// テスト用の認証情報
const testUser = {
  email: 'kazutofukushima1202@gmail.com',
  password: 'aikakumei'
};

// HTTPリクエスト関数
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: `${apiPrefix}${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // 認証トークンがあれば追加
    if (global.token) {
      options.headers['Authorization'] = `Bearer ${global.token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = { raw: data };
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsedData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// テスト関数
async function runTests() {
  try {
    console.log('\n------- 認証APIテスト開始 -------');
    
    // テスト1: ログインAPI
    console.log('\n🔍 テスト1: ログインAPI');
    const loginResponse = await makeRequest('POST', '/auth/login', testUser);
    console.log(`ステータスコード: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode === 200 && loginResponse.data.data.token) {
      console.log('✅ ログイン成功!');
      global.token = loginResponse.data.data.token;
      global.userId = loginResponse.data.data.user.id;
      console.log(`ユーザーID: ${global.userId}`);
      console.log(`ユーザーロール: ${loginResponse.data.data.user.role}`);
    } else {
      console.log('❌ ログイン失敗', loginResponse.data);
      return;
    }

    // テスト2: ユーザー情報取得API
    console.log('\n🔍 テスト2: ユーザー情報取得API');
    const meResponse = await makeRequest('GET', '/auth/me');
    console.log(`ステータスコード: ${meResponse.statusCode}`);
    
    if (meResponse.statusCode === 200) {
      console.log('✅ ユーザー情報取得成功!');
      console.log(`ユーザーID: ${meResponse.data.data.id}`);
      console.log(`ユーザー名: ${meResponse.data.data.name}`);
      console.log(`メールアドレス: ${meResponse.data.data.email}`);
    } else {
      console.log('❌ ユーザー情報取得失敗', meResponse.data);
    }

    // テスト3: 無効なトークンでのアクセス
    console.log('\n🔍 テスト3: 無効なトークンでのアクセス');
    global.token = 'invalid_token';
    const invalidTokenResponse = await makeRequest('GET', '/auth/me');
    console.log(`ステータスコード: ${invalidTokenResponse.statusCode}`);
    
    if (invalidTokenResponse.statusCode === 401) {
      console.log('✅ 予想通り認証エラー発生!');
    } else {
      console.log('❌ 無効なトークンでもアクセスできてしまいました', invalidTokenResponse.data);
    }

    // テスト4: ログアウトAPI
    console.log('\n🔍 テスト4: ログアウトAPI');
    global.token = loginResponse.data.data.token; // 有効なトークンに戻す
    const logoutResponse = await makeRequest('POST', '/auth/logout');
    console.log(`ステータスコード: ${logoutResponse.statusCode}`);
    
    if (logoutResponse.statusCode === 200) {
      console.log('✅ ログアウト成功!');
    } else {
      console.log('❌ ログアウト失敗', logoutResponse.data);
    }

    // テスト5: ログアウト後のアクセス
    console.log('\n🔍 テスト5: ログアウト後のアクセス');
    const afterLogoutResponse = await makeRequest('GET', '/auth/me');
    console.log(`ステータスコード: ${afterLogoutResponse.statusCode}`);
    
    if (afterLogoutResponse.statusCode === 401) {
      console.log('✅ ログアウト後は認証エラーになります (正常)');
    } else {
      console.log('❌ ログアウト後もアクセスできてしまいました', afterLogoutResponse.data);
    }

    console.log('\n------- 認証APIテスト完了 -------');
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
  }
}

// テスト実行
console.log(`API URL: http://${host}:${port}${apiPrefix}`);
runTests();