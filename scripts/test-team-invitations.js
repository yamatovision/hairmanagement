/**
 * チーム招待機能関連APIエンドポイントのテストスクリプト
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
let regularUserToken = null;

// テスト用変数
let testTeamId = null;
let testInvitationId = null;
let testInvitationToken = null;

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
 * ログイン関数 - 管理者
 */
async function loginAsAdmin() {
  try {
    console.log(`${'\x1b[34m'}管理者として認証トークンを取得中...${'\x1b[0m'}`);
    
    // 管理者ユーザーでログイン
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.data && loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      console.log(`${'\x1b[32m'}管理者認証トークンを取得しました${'\x1b[0m'}\n`);
      return true;
    } else {
      console.log(`${'\x1b[31m'}管理者認証トークンが取得できませんでした${'\x1b[0m'}\n`);
      return false;
    }
  } catch (error) {
    console.error(`${'\x1b[31m'}管理者ログインに失敗しました: ${error.message}${'\x1b[0m'}\n`);
    if (error.response && error.response.data) {
      console.log(JSON.stringify(error.response.data));
    }
    return false;
  }
}

/**
 * ログイン関数 - 一般ユーザー
 */
async function loginAsRegularUser() {
  try {
    console.log(`${'\x1b[34m'}一般ユーザーとして認証トークンを取得中...${'\x1b[0m'}`);
    
    // 一般ユーザーでログイン
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'user1@example.com', // ユーザー名を変更
      password: 'password123'     // パスワードを変更
    });
    
    if (loginResponse.data && loginResponse.data.success) {
      regularUserToken = loginResponse.data.data.token;
      console.log(`${'\x1b[32m'}一般ユーザー認証トークンを取得しました${'\x1b[0m'}\n`);
      return true;
    } else {
      console.log(`${'\x1b[31m'}一般ユーザー認証トークンが取得できませんでした${'\x1b[0m'}\n`);
      return false;
    }
  } catch (error) {
    console.error(`${'\x1b[31m'}一般ユーザーログインに失敗しました: ${error.message}${'\x1b[0m'}\n`);
    if (error.response && error.response.data) {
      console.log(JSON.stringify(error.response.data));
    }
    return false;
  }
}

/**
 * APIエンドポイントをテストする関数
 */
async function testEndpoint(testName, endpoint, method = 'GET', body = null, useRegularUser = false) {
  try {
    // URLに含まれる変数を置換
    let url = `${API_BASE_URL}${endpoint}`;
    
    // ヘッダーに認証トークンを含める
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const token = useRegularUser ? regularUserToken : authToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
  console.log(`${'\x1b[34m'}===== チーム招待機能関連エンドポイントのテスト開始 =====${'\x1b[0m'}\n`);
  startTime = new Date();
  
  // 管理者としてログイン
  const isAdminLoggedIn = await loginAsAdmin();
  if (!isAdminLoggedIn) {
    console.log(`${'\x1b[33m'}管理者認証なしでは続行できません${'\x1b[0m'}\n`);
    return;
  }
  
  // 一般ユーザーとしてログイン
  const isUserLoggedIn = await loginAsRegularUser();
  if (!isUserLoggedIn) {
    console.log(`${'\x1b[33m'}一般ユーザー認証なしでテストの一部をスキップします${'\x1b[0m'}\n`);
  }
  
  // テスト1: 新しいチームを作成
  const teamData = {
    name: 'テスト招待チーム',
    description: 'これはチーム招待テスト用のチームです',
    elementalType: 'water',
    tags: ['test', 'invitation']
  };
  
  const teamResult = await testEndpoint(
    '新しいチームの作成',
    '/teams',
    'POST',
    teamData
  );
  
  if (teamResult.success && teamResult.data && teamResult.data.data) {
    testTeamId = teamResult.data.data.id;
    console.log(`${'\x1b[34m'}テスト用チームID: ${testTeamId}${'\x1b[0m'}\n`);
    
    // テスト2: チーム招待の作成
    const invitationData = {
      teamId: testTeamId,
      email: 'test-invitation@example.com',
      role: 'employee', // member から employee に変更（許可されたロール値）
      message: 'これはテスト招待です'
    };
    
    const invitationResult = await testEndpoint(
      'チーム招待の作成',
      '/teams/invitations',
      'POST',
      invitationData
    );
    
    if (invitationResult.success && invitationResult.data && invitationResult.data.data) {
      testInvitationId = invitationResult.data.data.invitation._id;
      testInvitationToken = invitationResult.data.data.invitation.token;
      console.log(`${'\x1b[34m'}テスト用招待ID: ${testInvitationId}${'\x1b[0m'}`);
      console.log(`${'\x1b[34m'}テスト用招待トークン: ${testInvitationToken}${'\x1b[0m'}\n`);
      
      // テスト3: チームの保留中招待一覧を取得
      await testEndpoint(
        'チームの保留中招待一覧取得',
        `/teams/${testTeamId}/invitations`
      );
      
      // テスト4: トークンから招待詳細取得
      await testEndpoint(
        'トークンから招待詳細取得',
        `/teams/invitations/${testInvitationToken}`
      );
      
      // テスト5: 招待の再送信
      await testEndpoint(
        '招待の再送信',
        `/teams/invitations/${testInvitationId}/resend`,
        'POST'
      );
      
      // テスト6: 一般ユーザーで招待を受け入れる(アクセス許可の確認)
      if (isUserLoggedIn) {
        await testEndpoint(
          '一般ユーザーとして招待を受け入れる(権限チェック)',
          `/teams/invitations/${testInvitationToken}/accept`,
          'POST',
          {},
          true
        );
      }
      
      // テスト7: 招待を受け入れる(管理者として)
      await testEndpoint(
        '招待を受け入れる',
        `/teams/invitations/${testInvitationToken}/accept`,
        'POST'
      );
      
      // テスト8: 既に使用済みの招待を再度受け入れる(エラーチェック)
      await testEndpoint(
        '既に使用済みの招待を再度受け入れる(エラーチェック)',
        `/teams/invitations/${testInvitationToken}/accept`,
        'POST'
      );
      
      // 新しい招待を作成(拒否テスト用)
      const invitationData2 = {
        teamId: testTeamId,
        email: 'decline-test@example.com',
        role: 'employee', // member から employee に変更
        message: 'これは拒否テスト用招待です'
      };
      
      const invitationResult2 = await testEndpoint(
        '拒否テスト用チーム招待の作成',
        '/teams/invitations',
        'POST',
        invitationData2
      );
      
      if (invitationResult2.success && invitationResult2.data && invitationResult2.data.data) {
        const testInvitationToken2 = invitationResult2.data.data.token;
        
        // テスト9: 招待を拒否する
        await testEndpoint(
          '招待を拒否する',
          `/teams/invitations/${testInvitationToken2}/decline`,
          'POST'
        );
      }
      
      // 新しい招待を作成(キャンセルテスト用)
      const invitationData3 = {
        teamId: testTeamId,
        email: 'cancel-test@example.com',
        role: 'employee', // member から employee に変更
        message: 'これはキャンセルテスト用招待です'
      };
      
      const invitationResult3 = await testEndpoint(
        'キャンセルテスト用チーム招待の作成',
        '/teams/invitations',
        'POST',
        invitationData3
      );
      
      if (invitationResult3.success && invitationResult3.data && invitationResult3.data.data) {
        const testInvitationId3 = invitationResult3.data.data.id;
        
        // テスト10: 招待をキャンセルする
        await testEndpoint(
          '招待のキャンセル',
          `/teams/invitations/${testInvitationId3}`,
          'DELETE'
        );
      }
    } else {
      console.log(`${'\x1b[33m'}警告: チーム招待の作成に失敗したため、関連テストをスキップします${'\x1b[0m'}\n`);
    }
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
  const resultFile = path.join(resultDir, `team-invitation-api-test-${timestamp}.log`);
  
  const resultContent = `
チーム招待機能関連エンドポイントのテスト結果
======================================
実行日時: ${new Date().toLocaleString()}
API URL: ${API_BASE_URL}
管理者認証状態: ${isAdminLoggedIn ? '認証済み' : '未認証'}
一般ユーザー認証状態: ${isUserLoggedIn ? '認証済み' : '未認証'}
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