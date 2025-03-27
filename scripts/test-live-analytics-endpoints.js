/**
 * 経営者ダッシュボード関連エンドポイントの実データを使ったテスト
 * 
 * 使用方法:
 * node scripts/test-live-analytics-endpoints.js
 */

const axios = require('axios');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
dotenv.config();

// APIのベースURL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api/v1';
// MongoDB 接続文字列
const MONGODB_URI = process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';

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

// 成功したテストと失敗したテストの数
let successCount = 0;
let failureCount = 0;
let skippedCount = 0;

// テスト結果のログ
const testResults = [];

// 一時的にユーザーIDを保存
let testUserId = null;

/**
 * テストの結果を出力する関数
 */
function logResult(name, success, response = null, error = null, skipped = false) {
  if (skipped) {
    skippedCount++;
    console.log(`${colors.yellow}⚠ ${name}: テストスキップ${colors.reset}`);
    testResults.push({
      name,
      result: 'skipped',
      message: '依存するテストが失敗したため、スキップされました',
    });
    return;
  }

  if (success) {
    successCount++;
    console.log(`${colors.green}✓ ${name}: テスト成功${colors.reset}`);
    
    if (response) {
      if (process.env.DEBUG === 'true') {
        console.log(`  レスポンス:`, JSON.stringify(response, null, 2));
      } else {
        const dataPreview = Array.isArray(response.data)
          ? `配列 (${response.data.length}件)`
          : `オブジェクト (${Object.keys(response.data).length}プロパティ)`;
        console.log(`  レスポンス: ${dataPreview}`);
      }
    }
    
    testResults.push({
      name,
      result: 'success',
      status: response ? response.status : undefined,
      data: response ? response.data : undefined,
    });
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
    
    testResults.push({
      name,
      result: 'failure',
      error: error ? (error.response ? error.response.data : error.message) : undefined,
    });
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
  // テスト開始のログ
  console.log(`${colors.blue}テスト: ${name} (${method} ${url})${colors.reset}`);
  
  // 依存するテストの失敗チェック
  if (options.dependsOn && options.dependsOn.some(dep => testResults.find(r => r.name === dep && r.result !== 'success'))) {
    logResult(name, false, null, null, true);
    return { success: false, skipped: true };
  }
  
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
    
    // 成功レスポンスの処理
    logResult(name, true, { status: response.status, data: response.data });
    return { success: true, response };
  } catch (error) {
    // エラーレスポンスの処理
    logResult(name, false, null, error);
    return { success: false, error };
  }
}

/**
 * 結果をファイルに保存する関数
 */
function saveResults() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const resultPath = path.join(__dirname, `../logs/analytics-test-${timestamp}.json`);
  
  // logs ディレクトリが存在しない場合は作成
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // テスト結果をファイルに保存
  const resultData = {
    timestamp: new Date().toISOString(),
    summary: {
      success: successCount,
      failure: failureCount,
      skipped: skippedCount,
      total: successCount + failureCount + skippedCount,
    },
    apiBaseUrl: API_BASE_URL,
    results: testResults,
  };
  
  fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));
  console.log(`${colors.blue}テスト結果を保存しました: ${resultPath}${colors.reset}`);
  
  // マークダウン形式のレポートも生成
  const mdPath = path.join(__dirname, `../logs/analytics-test-${timestamp}.md`);
  const mdContent = generateMarkdownReport(resultData);
  fs.writeFileSync(mdPath, mdContent);
  console.log(`${colors.blue}マークダウンレポートを保存しました: ${mdPath}${colors.reset}`);
}

/**
 * マークダウン形式のレポートを生成
 */
function generateMarkdownReport(data) {
  const { timestamp, summary, apiBaseUrl, results } = data;
  
  // タイトルと概要
  let md = `# 経営者ダッシュボードAPIテスト結果\n\n`;
  md += `実行日時: ${new Date(timestamp).toLocaleString()}\n\n`;
  
  // サマリー
  md += `## テスト概要\n\n`;
  md += `- API基本URL: \`${apiBaseUrl}\`\n`;
  md += `- 合計テスト数: ${summary.total}\n`;
  md += `- 成功: ${summary.success}\n`;
  md += `- 失敗: ${summary.failure}\n`;
  md += `- スキップ: ${summary.skipped}\n\n`;
  
  // 成功率
  const successRate = Math.round((summary.success / (summary.total - summary.skipped)) * 100) || 0;
  md += `成功率: ${successRate}%\n\n`;
  
  // 詳細結果テーブル
  md += `## テスト詳細\n\n`;
  md += `| # | テスト名 | 結果 | ステータス | 詳細 |\n`;
  md += `|---|---------|------|------------|-------|\n`;
  
  results.forEach((result, index) => {
    const resultEmoji = result.result === 'success' ? '✅' : result.result === 'skipped' ? '⚠️' : '❌';
    const status = result.status || '-';
    let details = '-';
    
    if (result.result === 'success') {
      if (Array.isArray(result.data)) {
        details = `配列 (${result.data.length}件)`;
      } else if (result.data && typeof result.data === 'object') {
        details = `オブジェクト (${Object.keys(result.data).length}プロパティ)`;
      }
    } else if (result.result === 'failure') {
      details = result.error ? JSON.stringify(result.error).substring(0, 50) + '...' : '不明なエラー';
    } else if (result.result === 'skipped') {
      details = result.message || 'スキップされました';
    }
    
    md += `| ${index + 1} | ${result.name} | ${resultEmoji} | ${status} | ${details} |\n`;
  });
  
  return md;
}

/**
 * 全てのエンドポイントをテスト
 */
async function runTests() {
  console.log(`${colors.blue}===== 経営者ダッシュボード関連エンドポイントのテスト開始 =====${colors.reset}\n`);
  
  try {
    // バックエンドサーバーの起動確認
    console.log(`${colors.blue}バックエンドサーバーの起動を確認中...${colors.reset}`);
    try {
      await axios.get(`${API_BASE_URL}/`);
      console.log(`${colors.green}バックエンドサーバーが起動しています${colors.reset}\n`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`${colors.red}バックエンドサーバーが起動していません。サーバーを起動してから再度テストを実行してください。${colors.reset}\n`);
        process.exit(1);
      } else {
        console.log(`${colors.yellow}警告: バックエンドサーバーの起動確認で予期しないエラーが発生しましたが、テストを続行します${colors.reset}\n`);
      }
    }
    
    // テスト用のユーザーIDを取得
    console.log(`${colors.blue}テスト用のユーザーIDを取得中...${colors.reset}`);
    testUserId = await getTestUserId();
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
          if (!data) return false;
          if (!data.overallEngagement) return false;
          if (!data.sentimentDistribution) return false;
          if (!Array.isArray(data.followUpRecommendations)) return false;
          return true;
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
          if (!data) return false;
          if (!data.period) return false;
          if (!data.metrics) return false;
          if (!data.metrics.appUsage) return false;
          if (!data.metrics.sentiment) return false;
          return true;
        }
      }
    );
    
    // テスト3: フォローアップ推奨の取得
    await testEndpoint(
      'フォローアップ推奨の取得',
      'get',
      '/analytics/follow-up-recommendations',
      {
        dependsOn: ['チーム分析データの取得'],
        validate: (data) => {
          if (!Array.isArray(data)) return false;
          return data.every(item => item.userId && item.urgency && item.reason);
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
          if (!data) return false;
          if (!Array.isArray(data.labels)) return false;
          if (!Array.isArray(data.datasets)) return false;
          if (!data.datasets[0].data) return false;
          return true;
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
          if (!data) return false;
          if (typeof data.completionRate !== 'number') return false;
          if (typeof data.totalGoals !== 'number') return false;
          if (typeof data.completedGoals !== 'number') return false;
          return true;
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
        dependsOn: ['チーム分析データの取得'],
        validate: (data) => {
          if (!data) return false;
          if (!data.period) return false;
          const periodStart = new Date(data.period.startDate);
          const periodEnd = new Date(data.period.endDate);
          if (periodStart > startDate || periodEnd < endDate) {
            return false;
          }
          return true;
        }
      }
    );
    
    // テスト7: ユーザーIDを指定した感情分析トレンドの取得
    if (userEngagementResult.success) {
      await testEndpoint(
        'ユーザー指定の感情分析トレンドの取得',
        'get',
        `/analytics/sentiment-trend?userId=${testUserId}`,
        {
          dependsOn: ['感情分析トレンドの取得', 'ユーザーエンゲージメント分析の取得'],
          validate: (data) => {
            if (!data) return false;
            if (!Array.isArray(data.labels)) return false;
            if (!Array.isArray(data.datasets)) return false;
            if (data.labels.length === 0 || data.datasets[0].data.length === 0) return false;
            return true;
          }
        }
      );
    }
    
    // テスト8: 期間とユーザーIDを指定した感情分析トレンドの取得
    if (userEngagementResult.success) {
      await testEndpoint(
        '期間・ユーザー指定の感情分析トレンドの取得',
        'get',
        `/analytics/sentiment-trend?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&userId=${testUserId}`,
        {
          dependsOn: ['感情分析トレンドの取得', 'ユーザーエンゲージメント分析の取得'],
          validate: (data) => {
            if (!data) return false;
            if (!Array.isArray(data.labels)) return false;
            if (!Array.isArray(data.datasets)) return false;
            if (data.labels.length === 0) return false;
            return true;
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
    
    // 結果をファイルに保存
    saveResults();
    
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