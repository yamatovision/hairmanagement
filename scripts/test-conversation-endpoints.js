/**
 * POST /api/v1/conversations エンドポイントのデバッグスクリプト
 * このスクリプトは会話エンドポイントのデバッグ情報を収集します
 */
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
dotenv.config();

// APIのベースURL (IPv4アドレスを明示的に指定)
const API_BASE_URL = process.env.API_URL || 'http://127.0.0.1:5001/api/v1';

// ANSI カラーコード
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
};

// 成功したテストと失敗したテストをカウント
let successCount = 0;
let failureCount = 0;
let startTime;

// APIトークン
let authToken = null;
let userId = null;

/**
 * テスト結果をログに記録
 */
function logTestResult(name, success, data = null, error = null) {
  if (success) {
    successCount++;
    console.log(`${colors.green}✓ ${name}: 成功${colors.reset}`);
    if (data) {
      console.log(`  レスポンスタイプ: ${Array.isArray(data) ? '配列' : typeof data}`);
      if (typeof data === 'object' && data !== null) {
        console.log(`  レスポンスキー: ${Object.keys(data).join(', ')}`);
      }
      console.log(`  データサンプル: ${JSON.stringify(data).substring(0, 150)}...`);
    }
  } else {
    failureCount++;
    console.log(`${colors.red}✗ ${name}: 失敗${colors.reset}`);
    if (error) {
      console.log(`  エラー: ${error.message || JSON.stringify(error)}`);
      if (error.response) {
        console.log(`  ステータスコード: ${error.response.status}`);
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
    console.log(`${colors.blue}認証トークンを取得中...${colors.reset}`);
    
    // ログイン
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    }, {
      timeout: 10000 // 10秒タイムアウト
    });
    
    console.log(`${colors.cyan}ログインレスポンス: ${JSON.stringify(loginResponse.data).substring(0, 100)}...${colors.reset}`);
    
    // レスポンス形式の確認
    if (loginResponse.data && loginResponse.data.token) {
      // 直接tokenが含まれるパターン
      authToken = loginResponse.data.token;
      userId = loginResponse.data.user.id;
      console.log(`${colors.green}認証トークンを取得しました${colors.reset}`);
      console.log(`${colors.cyan}ユーザーID: ${userId}${colors.reset}\n`);
      return true;
    } else {
      console.log(`${colors.red}認証トークンが取得できませんでした${colors.reset}\n`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}ログインに失敗しました: ${error.message}${colors.reset}\n`);
    if (error.response && error.response.data) {
      console.log(JSON.stringify(error.response.data));
    }
    return false;
  }
}

/**
 * デバッグ情報付きでリクエストを送信する共通関数
 */
async function sendRequest(method, url, data = null, headers = {}, timeout = 30000) {
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`${colors.magenta}[${requestId}] リクエスト開始: ${method.toUpperCase()} ${url}${colors.reset}`);
  console.log(`${colors.magenta}[${requestId}] ヘッダー: ${JSON.stringify(headers)}${colors.reset}`);
  
  if (data) {
    console.log(`${colors.magenta}[${requestId}] データ: ${JSON.stringify(data)}${colors.reset}`);
  }
  
  const requestStartTime = Date.now();
  
  try {
    const config = {
      method,
      url,
      headers,
      timeout
    };
    
    if (data && (method === 'post' || method === 'put' || method === 'patch')) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    const requestDuration = Date.now() - requestStartTime;
    console.log(`${colors.green}[${requestId}] リクエスト成功 (${requestDuration}ms)${colors.reset}`);
    console.log(`${colors.green}[${requestId}] ステータスコード: ${response.status}${colors.reset}`);
    console.log(`${colors.green}[${requestId}] レスポンスヘッダー: ${JSON.stringify(response.headers)}${colors.reset}`);
    
    if (response.data) {
      if (typeof response.data === 'object') {
        console.log(`${colors.green}[${requestId}] レスポンスキー: ${Object.keys(response.data).join(', ')}${colors.reset}`);
      }
      console.log(`${colors.green}[${requestId}] レスポンス: ${JSON.stringify(response.data).substring(0, 150)}...${colors.reset}`);
    }
    
    return response;
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;
    console.log(`${colors.red}[${requestId}] リクエスト失敗 (${requestDuration}ms): ${error.message}${colors.reset}`);
    
    if (error.code === 'ECONNABORTED') {
      console.log(`${colors.red}[${requestId}] タイムアウト (${timeout}ms)${colors.reset}`);
    }
    
    if (error.response) {
      console.log(`${colors.red}[${requestId}] ステータスコード: ${error.response.status}${colors.reset}`);
      console.log(`${colors.red}[${requestId}] レスポンスヘッダー: ${JSON.stringify(error.response.headers)}${colors.reset}`);
      console.log(`${colors.red}[${requestId}] レスポンスデータ: ${JSON.stringify(error.response.data)}${colors.reset}`);
    }
    
    throw error;
  }
}

/**
 * デバッグエンドポイントをテスト
 */
async function testDebugEndpoint() {
  const testName = 'デバッグエンドポイント接続確認';
  try {
    console.log(`${colors.blue}${testName}を実行中...${colors.reset}`);
    
    // GET /api/v1/health リクエスト
    const response = await sendRequest('get', `${API_BASE_URL}/health`);
    
    if (response.data && response.data.status === 'ok') {
      logTestResult(testName, true, response.data);
      return { success: true, data: response.data };
    } else {
      throw new Error('ヘルスチェックエンドポイントからの応答が期待した形式ではありません');
    }
  } catch (error) {
    logTestResult(testName, false, null, error);
    return { success: false, error };
  }
}

/**
 * 運勢の取得をテスト
 */
async function testGetFortune() {
  const testName = 'デイリー運勢の取得テスト';
  try {
    console.log(`${colors.blue}${testName}を実行中...${colors.reset}`);
    
    if (!authToken) {
      throw new Error('認証トークンがありません');
    }
    
    // ヘッダーに認証トークンを含める
    const headers = {
      'Authorization': `Bearer ${authToken}`
    };
    
    // GET /api/v1/fortune/daily リクエスト (60秒タイムアウト)
    const response = await sendRequest('get', `${API_BASE_URL}/fortune/daily`, null, headers, 60000);
    
    if (response.data && response.data.success) {
      logTestResult(testName, true, response.data);
      return { success: true, data: response.data };
    } else {
      throw new Error('運勢エンドポイントからの応答が期待した形式ではありません');
    }
  } catch (error) {
    logTestResult(testName, false, null, error);
    return { success: false, error };
  }
}

/**
 * デバッグ直接会話エンドポイントを試す
 */
async function testDirectConversationsEndpoint() {
  const testName = 'デバッグ直接会話エンドポイント接続確認';
  try {
    console.log(`${colors.blue}${testName}を実行中...${colors.reset}`);
    
    if (!authToken) {
      throw new Error('認証トークンがありません');
    }
    
    // 今日の日付を取得
    const today = new Date().toISOString().split('T')[0];
    
    // リクエストデータ
    const requestData = {
      type: 'fortune',
      contextId: today
    };
    
    // ヘッダーに認証トークンを含める
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };
    
    // POST リクエスト (直接会話エンドポイント)
    const response = await sendRequest(
      'post',
      `${API_BASE_URL}/direct-conversations`,
      requestData,
      headers,
      60000 // 60秒タイムアウト
    );
    
    if (response.data && response.data.success) {
      const conversation = response.data.data;
      
      console.log(`${colors.cyan}会話ID: ${conversation.id}${colors.reset}`);
      console.log(`${colors.cyan}会話タイプ: ${conversation.type}${colors.reset}`);
      console.log(`${colors.cyan}メッセージ数: ${conversation.messages.length}${colors.reset}`);
      
      if (conversation.messages.length > 0) {
        console.log(`${colors.cyan}初期メッセージ: ${conversation.messages[0].content.substring(0, 50)}...${colors.reset}`);
      }
      
      logTestResult(testName, true, response.data);
      return { success: true, conversationId: conversation.id, data: response.data };
    } else {
      throw new Error('レスポンスが期待した形式ではありません');
    }
  } catch (error) {
    logTestResult(testName, false, null, error);
    return { success: false, error };
  }
}

/**
 * 会話を開始するテスト
 */
async function testStartConversation() {
  const testName = 'AI会話開始 (運勢タイプ)';
  try {
    console.log(`${colors.blue}${testName}を実行中...${colors.reset}`);
    
    if (!authToken) {
      throw new Error('認証トークンがありません');
    }
    
    // 今日の日付を取得
    const today = new Date().toISOString().split('T')[0];
    
    // リクエストデータ
    const requestData = {
      type: 'fortune',
      contextId: today
    };
    
    // ヘッダーに認証トークンを含める
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };
    
    // POST リクエスト (長いタイムアウト)
    const response = await sendRequest(
      'post',
      `${API_BASE_URL}/conversations`,
      requestData,
      headers,
      120000 // 120秒タイムアウト
    );
    
    if (response.data && response.data.success) {
      const conversation = response.data.data;
      
      console.log(`${colors.cyan}会話ID: ${conversation.id}${colors.reset}`);
      console.log(`${colors.cyan}会話タイプ: ${conversation.type}${colors.reset}`);
      console.log(`${colors.cyan}メッセージ数: ${conversation.messages.length}${colors.reset}`);
      
      if (conversation.messages.length > 0) {
        console.log(`${colors.cyan}初期メッセージ: ${conversation.messages[0].content.substring(0, 50)}...${colors.reset}`);
      }
      
      logTestResult(testName, true, response.data);
      return { success: true, conversationId: conversation.id, data: response.data };
    } else {
      throw new Error('レスポンスが期待した形式ではありません');
    }
  } catch (error) {
    logTestResult(testName, false, null, error);
    return { success: false, error };
  }
}

/**
 * テストを実行する関数
 */
async function runTests() {
  console.log(`${colors.blue}===== 会話システムAPIエンドポイントデバッグ開始 =====${colors.reset}\n`);
  console.log(`${colors.yellow}このスクリプトは様々なエンドポイントを調査し、会話が戻らない原因を探ります${colors.reset}\n`);
  startTime = new Date();
  
  // ヘルスチェック
  await testDebugEndpoint();
  
  // ログインして認証トークンを取得
  const isLoggedIn = await login();
  if (!isLoggedIn) {
    console.log(`${colors.yellow}認証に失敗したため、残りのテストをスキップします${colors.reset}\n`);
    return;
  }
  
  // 運勢取得テスト (AIサービスが使われるかチェック)
  console.log(`${colors.yellow}デイリー運勢エンドポイント（AIサービスを使用）をテスト中...${colors.reset}\n`);
  await testGetFortune();
  
  // 直接会話エンドポイントテスト (新規エンドポイント)
  console.log(`${colors.yellow}直接会話エンドポイントをテスト中...${colors.reset}\n`);
  await testDirectConversationsEndpoint();
  
  // 会話開始テスト (通常エンドポイント)
  console.log(`${colors.yellow}通常の会話エンドポイントをテスト中...${colors.reset}\n`);
  await testStartConversation();
  
  // 結果の集計
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
  
  console.log(`\n${colors.yellow}デバッグ結果:${colors.reset}`);
  console.log(`${colors.yellow}1. ヘルスチェックエンドポイント: ${successCount >= 1 ? '正常' : '異常'}${colors.reset}`);
  console.log(`${colors.yellow}2. 認証システム: ${isLoggedIn ? '正常' : '異常'}${colors.reset}`);
  console.log(`${colors.yellow}3. デイリー運勢API: ${successCount >= 2 ? '正常' : '異常'}${colors.reset}`);
  console.log(`${colors.yellow}4. 直接会話エンドポイント: ${successCount >= 3 ? '正常' : '異常'}${colors.reset}`);
  console.log(`${colors.yellow}5. 通常会話エンドポイント: ${successCount >= 4 ? '正常' : '異常'}${colors.reset}`);
  
  // テスト結果をファイルに保存
  const resultDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const resultFile = path.join(resultDir, `conversation-debug-${timestamp}.log`);
  
  const resultContent = `
会話システムAPIエンドポイントデバッグ結果
======================================
実行日時: ${new Date().toLocaleString()}
API URL: ${API_BASE_URL}
認証状態: ${isLoggedIn ? '認証済み' : '未認証'}
実行時間: ${duration.toFixed(2)}秒
テスト実行数: ${successCount + failureCount}
成功: ${successCount}
失敗: ${failureCount}

デバッグ結果:
1. ヘルスチェックエンドポイント: ${successCount >= 1 ? '正常' : '異常'}
2. 認証システム: ${isLoggedIn ? '正常' : '異常'}
3. デイリー運勢API: ${successCount >= 2 ? '正常' : '異常'}
4. 直接会話エンドポイント: ${successCount >= 3 ? '正常' : '異常'}
5. 通常会話エンドポイント: ${successCount >= 4 ? '正常' : '異常'}
  `.trim();
  
  fs.writeFileSync(resultFile, resultContent);
  console.log(`\nテスト結果を保存しました: ${resultFile}`);
}

// テストを実行
runTests().catch(error => {
  console.error(`${colors.red}テスト実行中にエラーが発生しました:${colors.reset}`, error);
});