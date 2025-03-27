/**
 * 経営者ダッシュボード関連エンドポイントの実テスト
 * 
 * 使用方法:
 * node scripts/run-api-tests.js
 */

const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
dotenv.config();

// APIのベースURL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api/v1';

// ANSI カラーコード
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

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
    console.log(`${colors.green}✓ ${name}: 成功${colors.reset}`);
    if (data) {
      console.log(`  レスポンスタイプ: ${Array.isArray(data) ? '配列' : typeof data}`);
      console.log(`  データ: ${JSON.stringify(data).substring(0, 100)}...`);
    }
  } else {
    failureCount++;
    console.log(`${colors.red}✗ ${name}: 失敗${colors.reset}`);
    if (error) {
      console.log(`  エラー: ${error.message || JSON.stringify(error)}`);
    }
  }
  console.log(''); // 空行
}

/**
 * ログイン関数
 */
async function login() {
  try {
    console.log(`${colors.blue}認証トークンを取得中...${colors.reset}`);
    
    // 管理者ユーザーでログイン
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'watanabe.takashi@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data && loginResponse.data.token) {
      authToken = loginResponse.data.token;
      console.log(`${colors.green}認証トークンを取得しました${colors.reset}\n`);
      return true;
    } else {
      console.log(`${colors.red}認証トークンが取得できませんでした${colors.reset}\n`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}ログインに失敗しました: ${error.message}${colors.reset}\n`);
    return false;
  }
}

/**
 * APIエンドポイントをテストする関数
 */
async function testEndpoint(testName, endpoint, params = {}) {
  try {
    // URLクエリパラメータがある場合はURLに追加
    let url = `${API_BASE_URL}${endpoint}`;
    const queryParams = [];
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        queryParams.push(`${key}=${encodeURIComponent(value)}`);
      }
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    // APIリクエスト（認証トークンを含める）
    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await axios.get(url, { headers });
    
    // データの検証
    if (!response.data) {
      throw new Error('データが返されませんでした');
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
  console.log(`${colors.blue}===== 経営者ダッシュボード関連エンドポイントのテスト開始 =====${colors.reset}\n`);
  startTime = new Date();
  
  // ログインして認証トークンを取得
  const isLoggedIn = await login();
  if (!isLoggedIn) {
    console.log(`${colors.yellow}認証なしでテストを続行します（失敗する可能性あり）${colors.reset}\n`);
  }
  
  // テスト1: チーム分析データの取得
  await testEndpoint(
    'チーム分析データの取得',
    '/test/team'
  );
  
  // テスト2: 期間指定のチーム分析データの取得
  await testEndpoint(
    '期間指定のチーム分析データの取得',
    '/test/team',
    {
      startDate: '2025-02-01T00:00:00.000Z',
      endDate: '2025-03-27T23:59:59.999Z',
    }
  );
  
  // ユーザーID取得
  let userResult;
  try {
    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await axios.get(`${API_BASE_URL}/users`, { headers });
    if (response.data && response.data.length > 0) {
      userResult = { success: true, userId: response.data[0]._id };
      console.log(`${colors.cyan}テスト用ユーザーID: ${userResult.userId}${colors.reset}\n`);
    } else {
      userResult = { success: false, error: new Error('ユーザーが見つかりません') };
      console.log(`${colors.yellow}警告: テスト用ユーザーが見つかりませんでした。ダミーIDを使用します${colors.reset}\n`);
    }
  } catch (error) {
    userResult = { success: false, error };
    console.log(`${colors.yellow}警告: ユーザー一覧の取得に失敗しました。ダミーIDを使用します${colors.reset}\n`);
  }
  
  const userId = userResult.success ? userResult.userId : '67e4822648268fbf1469e389'; // 有効なユーザーID
  
  // テスト3: ユーザーエンゲージメント分析の取得
  await testEndpoint(
    'ユーザーエンゲージメント分析の取得',
    `/test/users/${userId}/engagement`
  );
  
  // テスト4: フォローアップ推奨の取得
  await testEndpoint(
    'フォローアップ推奨の取得',
    '/test/follow-up-recommendations'
  );
  
  // テスト5: 感情分析トレンドの取得
  await testEndpoint(
    '感情分析トレンドの取得',
    '/test/sentiment-trend'
  );
  
  // テスト6: ユーザー指定の感情分析トレンドの取得
  await testEndpoint(
    'ユーザー指定の感情分析トレンドの取得',
    '/test/sentiment-trend',
    { userId }
  );
  
  // テスト7: 期間指定の感情分析トレンドの取得
  await testEndpoint(
    '期間・ユーザー指定の感情分析トレンドの取得',
    '/test/sentiment-trend',
    {
      userId,
      startDate: '2025-02-01T00:00:00.000Z',
      endDate: '2025-03-27T23:59:59.999Z',
    }
  );
  
  // テスト8: 目標達成率の取得
  await testEndpoint(
    '目標達成率の取得',
    '/test/goal-completion-rate'
  );
  
  // テスト結果サマリー
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`${colors.blue}===== テスト結果サマリー =====${colors.reset}`);
  console.log(`実行時間: ${duration.toFixed(2)}秒`);
  console.log(`テスト実行数: ${successCount + failureCount}`);
  console.log(`${colors.green}成功: ${successCount}${colors.reset}`);
  console.log(`${colors.red}失敗: ${failureCount}${colors.reset}`);
  
  if (failureCount === 0) {
    console.log(`\n${colors.green}すべてのテストが成功しました！${colors.reset}`);
  } else {
    console.log(`\n${colors.red}一部のテストが失敗しました。${colors.reset}`);
  }
  
  // テスト結果をファイルに保存
  const resultDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const resultFile = path.join(resultDir, `api-test-${timestamp}.log`);
  
  const resultContent = `
経営者ダッシュボード関連エンドポイントのテスト結果
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
  console.error(`${colors.red}テスト実行中にエラーが発生しました:${colors.reset}`, error);
});