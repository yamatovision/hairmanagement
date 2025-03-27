/**
 * 経営者ダッシュボード関連エンドポイントのテストスクリプト
 * 
 * 使用方法:
 * node scripts/test-analytics-endpoints.js
 */

const axios = require('axios');
const dotenv = require('dotenv');

// chalkの代わりにANSIエスケープシーケンスを使用
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  grey: (text) => `\x1b[90m${text}\x1b[0m`
};

// 環境変数の読み込み
dotenv.config();

// APIのベースURL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api/v1';

// テスト用のダミートークン（実際のアプリでは認証プロセスから取得）
// 管理者でログインして取得したトークンを使用
const TOKEN = process.env.TEST_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTQ4N2RiYzRhNThhNjJkMzhhYzZhYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MzAzMjcwMn0.P1riwxDzicPlRHTEnXJ_FLBMkl4n3ou2hQaW8O5a1pg';

// テスト用ユーザーID（実際のアプリではデータベースから取得）
const TEST_USER_ID = process.env.TEST_USER_ID || '67e487dbc4a58a62d38ac6ac';

// HTTPクライアントの設定
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
  }
});

/**
 * テスト実行結果を出力する関数
 */
const logResult = (name, success, response = null, error = null) => {
  if (success) {
    console.log(colors.green(`✓ ${name}: テスト成功`));
    if (response && process.env.DEBUG) {
      console.log(colors.grey('  レスポンス:'), response.data);
    }
  } else {
    console.log(colors.red(`✗ ${name}: テスト失敗`));
    if (error) {
      if (error.response) {
        console.log(colors.grey('  ステータス:'), error.response.status);
        console.log(colors.grey('  レスポンス:'), error.response.data);
      } else {
        console.log(colors.grey('  エラー:'), error.message);
      }
    }
  }
  console.log('\n');
};

/**
 * APIエンドポイントをテストする関数
 */
const testEndpoint = async (name, method, url, data = null) => {
  try {
    let response;
    
    if (method.toLowerCase() === 'get') {
      response = await client.get(url);
    } else if (method.toLowerCase() === 'post') {
      response = await client.post(url, data);
    } else if (method.toLowerCase() === 'put') {
      response = await client.put(url, data);
    } else if (method.toLowerCase() === 'delete') {
      response = await client.delete(url);
    }
    
    logResult(name, true, response);
    return { success: true, response };
  } catch (error) {
    logResult(name, false, null, error);
    return { success: false, error };
  }
};

/**
 * 全てのエンドポイントをテスト
 */
const runTests = async () => {
  console.log(colors.blue('===== 経営者ダッシュボード関連エンドポイントのテスト開始 =====\n'));
  
  // テスト1: チーム分析データの取得
  await testEndpoint(
    'チーム分析データの取得',
    'GET',
    '/analytics/team'
  );
  
  // テスト2: 特定ユーザーのエンゲージメント分析の取得
  await testEndpoint(
    'ユーザーエンゲージメント分析の取得',
    'GET',
    `/analytics/users/${TEST_USER_ID}/engagement`
  );
  
  // テスト3: フォローアップ推奨の取得
  await testEndpoint(
    'フォローアップ推奨の取得',
    'GET',
    '/analytics/follow-up-recommendations'
  );
  
  // テスト4: 感情分析トレンドの取得
  await testEndpoint(
    '感情分析トレンドの取得',
    'GET',
    '/analytics/sentiment-trend'
  );
  
  // テスト5: 目標達成率の取得
  await testEndpoint(
    '目標達成率の取得',
    'GET',
    '/analytics/goal-completion-rate'
  );
  
  // 期間を指定したテスト
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 30日前
  
  const endDate = new Date();
  
  // テスト6: 期間を指定したチーム分析データの取得
  await testEndpoint(
    '期間指定のチーム分析データの取得',
    'GET',
    `/analytics/team?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  );
  
  // テスト7: 期間とユーザーIDを指定した感情分析トレンドの取得
  await testEndpoint(
    '期間・ユーザー指定の感情分析トレンドの取得',
    'GET',
    `/analytics/sentiment-trend?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&userId=${TEST_USER_ID}`
  );
  
  console.log(colors.blue('===== テスト完了 ====='));
};

// テストを実行
runTests().catch(error => {
  console.error(colors.red('テスト実行中にエラーが発生しました:'), error);
});