/**
 * ユーザープロフィール関連APIエンドポイントのテストスクリプト
 */
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
dotenv.config();

// APIのベースURL
const API_BASE_URL = process.env.API_URL || 'http://localhost:5001/api/v1';

// 成功したテストと失敗したテストをカウント
let successCount = 0;
let failureCount = 0;
let startTime;

// APIトークン
let authToken = null;

/**
 * テスト結果をログに記録
 */
function logTestResult(name, success, data = null, error = null) {
  if (success) {
    successCount++;
    console.log(`${'\x1b[32m'}✓ ${name}: 成功${'\x1b[0m'}`);
    if (data) {
      console.log(`  データタイプ: ${Array.isArray(data) ? '配列' : typeof data}`);
      console.log(`  データサンプル: ${JSON.stringify(data).substring(0, 150)}...`);
    }
  } else {
    failureCount++;
    console.log(`${'\x1b[31m'}✗ ${name}: 失敗${'\x1b[0m'}`);
    if (error) {
      console.log(`  エラー: ${error.message || JSON.stringify(error)}`);
      if (error.response && error.response.data) {
        console.log(`  レスポンスデータ: ${JSON.stringify(error.response.data)}`);
      }
    }
  }
  console.log(''); // 空行
}

/**
 * ログイン関数
 */
async function login() {
  try {
    console.log(`${'\x1b[34m'}認証トークンを取得中...${'\x1b[0m'}`);
    
    // 管理者ユーザーでログイン
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.data && (loginResponse.data.token || (loginResponse.data.data && loginResponse.data.data.token))) {
      // トークンの場所が異なる可能性があるための対応
      authToken = loginResponse.data.token || loginResponse.data.data.token;
      console.log(`${'\x1b[32m'}認証トークンを取得しました${'\x1b[0m'}\n`);
      return true;
    } else {
      console.log(`${'\x1b[31m'}認証トークンが取得できませんでした${'\x1b[0m'}\n`);
      console.log(JSON.stringify(loginResponse.data));
      return false;
    }
  } catch (error) {
    console.error(`${'\x1b[31m'}ログインに失敗しました: ${error.message}${'\x1b[0m'}\n`);
    if (error.response && error.response.data) {
      console.log(JSON.stringify(error.response.data));
    }
    return false;
  }
}

/**
 * APIエンドポイントをテストする関数
 */
async function testEndpoint(testName, endpoint, method = 'GET', body = null) {
  try {
    // URLに含まれる変数を置換
    let url = `${API_BASE_URL}${endpoint}`;
    
    // ヘッダーに認証トークンを含める
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const options = { headers };
    
    // APIリクエスト
    let response;
    
    switch (method.toUpperCase()) {
      case 'GET':
        response = await axios.get(url, options);
        break;
      case 'POST':
        response = await axios.post(url, body, options);
        break;
      case 'PUT':
        response = await axios.put(url, body, options);
        break;
      case 'DELETE':
        response = await axios.delete(url, options);
        break;
      default:
        throw new Error(`サポートされていないHTTPメソッド: ${method}`);
    }
    
    logTestResult(testName, true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logTestResult(testName, false, null, error);
    return { success: false, error };
  }
}

/**
 * テストを実行する関数
 */
async function runTests() {
  console.log(`${'\x1b[34m'}===== ユーザープロフィール関連エンドポイントのテスト開始 =====${'\x1b[0m'}\n`);
  startTime = new Date();
  
  // ログインして認証トークンを取得
  const isLoggedIn = await login();
  if (!isLoggedIn) {
    console.log(`${'\x1b[33m'}認証なしでテストを続行します（失敗する可能性あり）${'\x1b[0m'}\n`);
  }
  
  // テスト1: 現在のユーザー情報取得
  await testEndpoint(
    '現在のユーザー情報取得',
    '/users/me'
  );
  
  // テスト2: ユーザーリスト取得（管理者のみ）
  await testEndpoint(
    'ユーザーリスト取得',
    '/users'
  );
  
  // テスト3: ユーザー情報更新
  const updateData = {
    name: '管理者（更新）',
    notificationSettings: {
      dailyFortune: true,
      teamEvents: true
    }
  };
  
  await testEndpoint(
    'ユーザー情報更新',
    '/users/me',
    'PUT',
    updateData
  );
  
  // テスト4: 通知設定の更新
  const notificationData = {
    dailyFortune: true,
    promptQuestions: false,
    teamEvents: true,
    goalReminders: true,
    systemUpdates: false
  };
  
  await testEndpoint(
    '通知設定の更新',
    '/users/me/notification-settings',
    'PUT',
    notificationData
  );
  
  // テスト5: 特定のユーザーの情報取得（管理者のみ）
  // 注意: 実際のユーザーIDが必要
  // ここではダミーIDを使用
  // 実際のテストでは存在するユーザーIDに置き換えてください
  const userId = 'REPLACE_WITH_ACTUAL_USER_ID';
  
  try {
    // まずユーザーリストを取得してIDを取得
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (usersResponse.data && usersResponse.data.data && usersResponse.data.data.length > 0) {
      // 最初のユーザーID（管理者自身以外）を使用
      const users = usersResponse.data.data;
      let testUserId = null;
      
      for (const user of users) {
        if (user.email !== 'admin@example.com') {
          testUserId = user.id;
          break;
        }
      }
      
      // テストユーザーIDが見つかった場合
      if (testUserId) {
        await testEndpoint(
          '特定のユーザー情報取得',
          `/users/${testUserId}`
        );
      } else {
        console.log(`${'\x1b[33m'}警告: テスト用の非管理者ユーザーが見つかりませんでした。テストはスキップされます。${'\x1b[0m'}\n`);
      }
    } else {
      console.log(`${'\x1b[33m'}警告: ユーザーリストの取得に失敗しました。テストはスキップされます。${'\x1b[0m'}\n`);
    }
  } catch (error) {
    console.log(`${'\x1b[33m'}警告: ユーザーIDの取得中にエラーが発生しました。テストはスキップされます。${'\x1b[0m'}\n`);
  }
  
  // 結果の集計
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`${'\x1b[34m'}===== テスト結果サマリー =====${'\x1b[0m'}`);
  console.log(`実行時間: ${duration.toFixed(2)}秒`);
  console.log(`テスト実行数: ${successCount + failureCount}`);
  console.log(`${'\x1b[32m'}成功: ${successCount}${'\x1b[0m'}`);
  console.log(`${'\x1b[31m'}失敗: ${failureCount}${'\x1b[0m'}`);
  
  if (failureCount === 0) {
    console.log(`\n${'\x1b[32m'}すべてのテストが成功しました！${'\x1b[0m'}`);
  } else {
    console.log(`\n${'\x1b[31m'}一部のテストが失敗しました。${'\x1b[0m'}`);
  }
  
  // テスト結果をファイルに保存
  const resultDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const resultFile = path.join(resultDir, `user-api-test-${timestamp}.log`);
  
  const resultContent = `
ユーザープロフィール関連エンドポイントのテスト結果
======================================
実行日時: ${new Date().toLocaleString()}
API URL: ${API_BASE_URL}
認証状態: ${isLoggedIn ? '認証済み' : '未認証'}
実行時間: ${duration.toFixed(2)}秒
テスト実行数: ${successCount + failureCount}
成功: ${successCount}
失敗: ${failureCount}
  `.trim();
  
  fs.writeFileSync(resultFile, resultContent);
  console.log(`\nテスト結果を保存しました: ${resultFile}`);
}

// テストを実行
runTests().catch(error => {
  console.error(`${'\x1b[31m'}テスト実行中にエラーが発生しました:${'\x1b[0m'}`, error);
});