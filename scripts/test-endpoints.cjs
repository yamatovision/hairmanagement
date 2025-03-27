/**
 * 経営者ダッシュボード関連エンドポイントの実データを使ったテスト
 * CommonJS形式
 * 
 * 使用方法:
 * node scripts/test-endpoints.cjs
 */

const axios = require('axios');
const mongoose = require('mongoose');

// APIのベースURL
const API_BASE_URL = 'http://localhost:5000/api/v1';
// MongoDB 接続文字列
const MONGODB_URI = 'mongodb://localhost:27017/patrolmanagement';

// ANSI エスケープシーケンスによる色付け
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// テスト結果
let successCount = 0;
let failureCount = 0;
let skippedCount = 0;

/**
 * テストの結果を出力する関数
 */
function logResult(name, success, response = null, error = null, skipped = false) {
  if (skipped) {
    skippedCount++;
    console.log(`${colors.yellow}⚠ ${name}: テストスキップ${colors.reset}`);
    return;
  }

  if (success) {
    successCount++;
    console.log(`${colors.green}✓ ${name}: テスト成功${colors.reset}`);
    
    if (response) {
      const dataPreview = Array.isArray(response.data)
        ? `配列 (${response.data.length}件)`
        : `オブジェクト (${Object.keys(response.data).length}プロパティ)`;
      console.log(`  レスポンス: ${dataPreview}`);
    }
  } else {
    failureCount++;
    console.log(`${colors.red}✗ ${name}: テスト失敗${colors.reset}`);
    
    if (error) {
      if (error.response) {
        console.log(`  ${colors.red}ステータス: ${error.response.status}${colors.reset}`);
        console.log(`  ${colors.red}レスポンス: ${JSON.stringify(error.response.data)}${colors.reset}`);
      } else {
        console.log(`  ${colors.red}エラー: ${error.message}${colors.reset}`);
      }
    }
  }
  
  console.log(''); // 空行
}

/**
 * MongoDB からテスト用のユーザーIDを取得
 */
async function getTestUserId() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // 管理者ユーザーを検索
    const manager = await usersCollection.findOne({ role: 'manager' });
    if (manager) {
      return manager._id.toString();
    }
    
    // 管理者がいなければ一般ユーザーを検索
    const anyUser = await usersCollection.findOne({});
    if (anyUser) {
      return anyUser._id.toString();
    }
    
    return null;
  } catch (error) {
    console.error('MongoDB からのユーザーID取得に失敗:', error);
    return null;
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * APIエンドポイントをテストする関数
 */
async function testEndpoint(name, method, url, options = {}) {
  console.log(`${colors.blue}テスト: ${name} (${method} ${url})${colors.reset}`);
  
  try {
    // APIリクエストを実行
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      ...options,
    };
    
    const response = await axios(config);
    
    // データのバリデーション
    let isValid = true;
    let validationError = null;
    
    if (options.validate && typeof options.validate === 'function') {
      try {
        isValid = options.validate(response.data);
      } catch (error) {
        isValid = false;
        validationError = error;
      }
    }
    
    if (!isValid) {
      logResult(name, false, null, { message: `バリデーションエラー: ${validationError ? validationError.message : '不明なエラー'}` });
      return { success: false, response };
    }
    
    logResult(name, true, { status: response.status, data: response.data });
    return { success: true, response };
  } catch (error) {
    logResult(name, false, null, error);
    return { success: false, error };
  }
}

/**
 * バックエンドサーバーの状態を確認
 */
async function checkBackendServer() {
  try {
    await axios.get(`${API_BASE_URL}/`);
    console.log(`${colors.green}バックエンドサーバーが起動しています${colors.reset}\n`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`${colors.red}バックエンドサーバーが起動していません。サーバーを起動してから再度テストを実行してください。${colors.reset}\n`);
      return false;
    } else {
      console.log(`${colors.yellow}警告: バックエンドサーバーの起動確認で予期しないエラーが発生しましたが、テストを続行します${colors.reset}\n`);
      return true;
    }
  }
}

/**
 * 全てのエンドポイントをテスト
 */
async function runTests() {
  console.log(`${colors.blue}===== 経営者ダッシュボード関連エンドポイントのテスト開始 =====${colors.reset}\n`);
  
  try {
    // バックエンドサーバーの起動確認
    const isServerRunning = await checkBackendServer();
    if (!isServerRunning) {
      process.exit(1);
    }
    
    // テスト用のユーザーIDを取得
    console.log(`${colors.blue}テスト用のユーザーIDを取得中...${colors.reset}`);
    let testUserId = await getTestUserId();
    if (testUserId) {
      console.log(`${colors.green}テスト用のユーザーID: ${testUserId}${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}警告: ユーザーIDの取得に失敗しました。ダミーIDを使用します${colors.reset}\n`);
      testUserId = '507f1f77bcf86cd799439011'; // ダミーのObjectId
    }
    
    // テスト1: チーム分析データの取得
    await testEndpoint(
      'チーム分析データの取得',
      'get',
      '/analytics/team',
      {
        validate: (data) => {
          return data && data.overallEngagement && data.sentimentDistribution;
        }
      }
    );
    
    // テスト2: 特定ユーザーのエンゲージメント分析の取得
    const userEngagementResult = await testEndpoint(
      'ユーザーエンゲージメント分析の取得',
      'get',
      `/analytics/users/${testUserId}/engagement`,
      {
        validate: (data) => {
          return data && data.period && data.metrics && data.metrics.appUsage && data.metrics.sentiment;
        }
      }
    );
    
    // テスト3: フォローアップ推奨の取得
    await testEndpoint(
      'フォローアップ推奨の取得',
      'get',
      '/analytics/follow-up-recommendations',
      {
        validate: (data) => {
          return Array.isArray(data);
        }
      }
    );
    
    // テスト4: 感情分析トレンドの取得
    await testEndpoint(
      '感情分析トレンドの取得',
      'get',
      '/analytics/sentiment-trend',
      {
        validate: (data) => {
          return data && data.labels && data.datasets && data.datasets[0] && data.datasets[0].data;
        }
      }
    );
    
    // テスト5: 目標達成率の取得
    await testEndpoint(
      '目標達成率の取得',
      'get',
      '/analytics/goal-completion-rate',
      {
        validate: (data) => {
          return data && typeof data.completionRate === 'number' && typeof data.totalGoals === 'number';
        }
      }
    );
    
    // 期間を指定したテスト
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 30日前
    
    const endDate = new Date();
    
    // テスト6: 期間を指定したチーム分析データの取得
    await testEndpoint(
      '期間指定のチーム分析データの取得',
      'get',
      `/analytics/team?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        validate: (data) => {
          return data && data.period;
        }
      }
    );
    
    // テスト7: ユーザーIDを指定した感情分析トレンドの取得
    if (userEngagementResult && userEngagementResult.success) {
      await testEndpoint(
        'ユーザー指定の感情分析トレンドの取得',
        'get',
        `/analytics/sentiment-trend?userId=${testUserId}`,
        {
          validate: (data) => {
            return data && data.labels && data.datasets && data.datasets[0] && data.datasets[0].data;
          }
        }
      );
    }
    
    // 結果サマリー
    console.log(`${colors.blue}===== テスト結果サマリー =====${colors.reset}`);
    console.log(`${colors.bright}テスト実行数: ${successCount + failureCount + skippedCount}${colors.reset}`);
    console.log(`${colors.green}成功: ${successCount}${colors.reset}`);
    console.log(`${colors.red}失敗: ${failureCount}${colors.reset}`);
    console.log(`${colors.yellow}スキップ: ${skippedCount}${colors.reset}`);
    
    if (failureCount > 0) {
      console.log(`\n${colors.red}一部のテストが失敗しました。${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`\n${colors.green}全てのテストが成功しました！${colors.reset}`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`${colors.red}テスト実行中にエラーが発生しました:${colors.reset}`, error);
    process.exit(1);
  }
}

// テストを実行
runTests().catch(error => {
  console.error(`${colors.red}予期しないエラーが発生しました:${colors.reset}`, error);
  process.exit(1);
});