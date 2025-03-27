/**
 * 経営者ダッシュボード関連エンドポイントのシンプルなテストスクリプト
 */
const http = require('http');

// テスト対象のエンドポイント定義
const endpoints = [
  {
    name: 'チーム分析データの取得',
    path: '/api/v1/analytics/team',
    method: 'GET'
  },
  {
    name: 'ユーザーエンゲージメント分析の取得',
    path: '/api/v1/analytics/users/1/engagement',
    method: 'GET'
  },
  {
    name: 'フォローアップ推奨の取得',
    path: '/api/v1/analytics/follow-up-recommendations',
    method: 'GET'
  },
  {
    name: 'センチメントトレンドの取得',
    path: '/api/v1/analytics/sentiment-trend',
    method: 'GET'
  },
  {
    name: '目標達成率の取得',
    path: '/api/v1/analytics/goal-completion-rate',
    method: 'GET'
  }
];

// テスト設定
const HOST = 'localhost';
const PORT = 5000;
const TOKEN = 'dummy-token'; // 実際のテストでは有効なトークンが必要

// リクエスト送信関数
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        let responseData;
        try {
          responseData = data ? JSON.parse(data) : {};
        } catch (error) {
          responseData = { error: 'JSONのパースに失敗しました', data };
        }
        
        resolve({
          statusCode: res.statusCode,
          data: responseData
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// 全エンドポイントのテスト実行
async function runTests() {
  console.log('===== 経営者ダッシュボード関連エンドポイントのテスト開始 =====\n');
  
  // サーバーに接続できるか事前チェック
  try {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/',
      method: 'GET'
    };
    
    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        resolve();
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
    
    console.log('サーバー接続: 成功\n');
  } catch (error) {
    console.log('サーバー接続: 失敗');
    console.log(`エラー: ${error.message}`);
    console.log('\n注意: バックエンドサーバーが起動していない可能性があります。');
    console.log('      サーバーを起動して再度テストを実行してください。\n');
    return;
  }
  
  let successCount = 0;
  
  // 各エンドポイントをテスト
  for (const endpoint of endpoints) {
    console.log(`テスト: ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
    
    try {
      const result = await makeRequest(endpoint);
      
      if (result.statusCode >= 200 && result.statusCode < 300) {
        console.log(`  ステータス: ${result.statusCode} (成功)`);
        console.log('  レスポンス: データを正常に受信');
        successCount++;
      } else {
        console.log(`  ステータス: ${result.statusCode} (失敗)`);
        console.log(`  レスポンス: ${JSON.stringify(result.data)}`);
      }
    } catch (error) {
      console.log(`  エラー: ${error.message}`);
    }
    
    console.log(''); // 空行
  }
  
  // 結果サマリー
  console.log('===== テスト結果 =====');
  console.log(`成功: ${successCount}/${endpoints.length}`);
  console.log(`失敗: ${endpoints.length - successCount}/${endpoints.length}`);
  
  if (successCount === endpoints.length) {
    console.log('\n全てのテストが成功しました！');
  } else {
    console.log('\n一部のテストが失敗しました。サーバーが起動していて、認証が正しく設定されていることを確認してください。');
  }
}

// テスト実行
runTests().catch(error => {
  console.error('テスト実行中にエラーが発生しました:', error);
});