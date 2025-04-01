/**
 * チーム連携機能関連APIエンドポイントのテストスクリプト
 */
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
dotenv.config();

// APIのベースURL
const API_BASE_URL = process.env.API_URL || 'http://0.0.0.0:8080/api';

// 成功したテストと失敗したテストをカウント
let successCount = 0;
let failureCount = 0;
let startTime;

// APIトークン
let authToken = null;

// テスト用データ
let testTeamId = null;
let testMemberId = null;

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
    
    if (loginResponse.data && loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      console.log(`${'\x1b[32m'}認証トークンを取得しました${'\x1b[0m'}\n`);
      return true;
    } else {
      console.log(`${'\x1b[31m'}認証トークンが取得できませんでした${'\x1b[0m'}\n`);
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
  console.log(`${'\x1b[34m'}===== チーム連携機能関連エンドポイントのテスト開始 =====${'\x1b[0m'}\n`);
  startTime = new Date();
  
  // ログインして認証トークンを取得
  const isLoggedIn = await login();
  if (!isLoggedIn) {
    console.log(`${'\x1b[33m'}認証なしでテストを続行します（失敗する可能性あり）${'\x1b[0m'}\n`);
  }
  
  // テスト1: チーム一覧を取得
  await testEndpoint(
    'チーム一覧の取得',
    '/teams'
  );
  
  // テスト2: 新しいチームを作成
  const createTeamData = {
    name: 'テストチーム',
    description: 'これはテスト用のチームです',
    department: 'システム開発部'
  };
  
  const createTeamResult = await testEndpoint(
    '新規チーム作成',
    '/teams',
    'POST',
    createTeamData
  );
  
  // チームIDを保存
  if (createTeamResult.success && createTeamResult.data && createTeamResult.data.data) {
    testTeamId = createTeamResult.data.data.id || createTeamResult.data.data._id;
    console.log(`作成されたチームID: ${testTeamId}`);
    
    // テスト3: 特定のチーム詳細を取得
    await testEndpoint(
      'チーム詳細の取得',
      `/teams/${testTeamId}`
    );
    
    // テスト4: チーム情報を更新
    const updateTeamData = {
      name: '更新されたテストチーム',
      description: 'これは更新されたテスト用のチームです'
    };
    
    await testEndpoint(
      'チーム情報の更新',
      `/teams/${testTeamId}`,
      'PUT',
      updateTeamData
    );
    
    // テスト5: チームにメンバーを追加
    const addMemberData = {
      userId: 'self', // テスト用に自分自身をメンバーとして追加
      role: 'member'
    };
    
    const addMemberResult = await testEndpoint(
      'チームメンバーの追加',
      `/teams/${testTeamId}/members`,
      'POST',
      addMemberData
    );
    
    // メンバーIDを保存
    if (addMemberResult.success && addMemberResult.data && addMemberResult.data.data) {
      testMemberId = addMemberResult.data.data.id || addMemberResult.data.data.userId || 'self';
      console.log(`追加されたメンバーID: ${testMemberId}`);
      
      // テスト6: メンバーの役割を更新
      const updateRoleData = {
        role: 'admin'
      };
      
      await testEndpoint(
        'メンバー役割の更新',
        `/teams/${testTeamId}/members/${testMemberId}/role`,
        'PUT',
        updateRoleData
      );
      
      // テスト7: チームの相性分析
      await testEndpoint(
        'チーム相性分析',
        `/teams/${testTeamId}/compatibility`
      );
      
      // テスト8: メンバー招待を送信
      const inviteData = {
        email: 'test-invite@example.com',
        role: 'member',
        message: 'チームに参加してください'
      };
      
      await testEndpoint(
        'メンバー招待の送信',
        `/teams/${testTeamId}/invite`,
        'POST',
        inviteData
      );
      
      // テスト9: チームからメンバーを削除
      await testEndpoint(
        'チームメンバーの削除',
        `/teams/${testTeamId}/members/${testMemberId}`,
        'DELETE'
      );
    } else {
      console.log(`${'\x1b[33m'}警告: チームメンバーの追加に失敗したため、関連テストをスキップします${'\x1b[0m'}\n`);
    }
    
    // テスト10: チームを削除
    await testEndpoint(
      'チームの削除',
      `/teams/${testTeamId}`,
      'DELETE'
    );
  } else {
    console.log(`${'\x1b[33m'}警告: チームの作成に失敗したため、関連テストをスキップします${'\x1b[0m'}\n`);
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
  const resultFile = path.join(resultDir, `team-api-test-${timestamp}.log`);
  
  const resultContent = `
チーム連携機能関連エンドポイントのテスト結果
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