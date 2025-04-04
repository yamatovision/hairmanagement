/**
 * 地支十神データ確認用のテストメッセージ送信スクリプト
 * サーバーを起動した状態で実行してください
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// API設定
const API_URL = 'http://127.0.0.1:5001';  // 修正: 正しいポート5001を使用
const API_ENDPOINT = '/api/v1/direct-conversations';
const AUTH_ENDPOINT = '/api/v1/auth/login';

// テスト用ユーザー
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// ログファイルのセットアップ
const logPath = path.join(__dirname, 'test-logs', 'direct-chat-test-log.txt');
const logDir = path.dirname(logPath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logStream = fs.createWriteStream(logPath, { flags: 'w' });

// テストログ関数
function log(message) {
  console.log(message);
  logStream.write(message + '\n');
}

async function sendTestMessage() {
  try {
    log('===== サーバーログ確認用テスト =====');
    log(`時刻: ${new Date().toISOString()}`);
    log('APIエンドポイント: ' + API_URL);

    // 1. ログイン
    log('\nステップ1: ログイン');
    const loginResponse = await axios.post(`${API_URL}${AUTH_ENDPOINT}`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (!loginResponse.data || !loginResponse.data.token) {
      throw new Error('ログインに失敗しました');
    }

    const token = loginResponse.data.token;
    log('ログイン成功: トークン取得');

    // 2. テストメッセージ送信
    log('\nステップ2: テストメッセージ送信');
    const message = 'これはシステムメッセージのログ出力テストです。地支十神情報が含まれているか確認してください。';
    
    log(`リクエスト送信: ${API_URL}${API_ENDPOINT}`);
    log('リクエスト内容:');
    log(JSON.stringify({
      message,
      type: 'fortune'
    }, null, 2));

    // APIリクエスト送信
    const response = await axios.post(
      `${API_URL}${API_ENDPOINT}`,
      {
        message,
        type: 'fortune'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 3. レスポンス確認
    log('\nステップ3: レスポンス確認');
    log('レスポンスステータス: ' + response.status);
    log('レスポンスデータサマリー:');
    
    if (response.data && response.data.data) {
      log(`- メッセージ数: ${response.data.data.messages?.length || 0}`);
      log(`- トークン使用量: ${JSON.stringify(response.data.data.usage)}`);
    }

    // 4. サーバーログ確認手順
    log('\n重要: サーバーコンソールで以下のログを確認してください:');
    log('1. "===== 送信される四柱推命システムメッセージ ====="');
    log('2. "====== メッセージフローを確認します ======"');
    log('3. "===== Claude APIに送信されるリクエスト ====="');
    log('4. "地支十神情報存在: あり ✓"');
    
    log('\nこれらのログがサーバーコンソールに表示されていない場合:');
    log('- NODE_ENV=development が設定されていることを確認');
    log('- クリアなコンソール出力のためにサーバーを再起動');
    log('- ログレベルが適切に設定されていることを確認');

    log('\n===== テスト完了 =====');
  } catch (error) {
    log(`エラー発生: ${error.message}`);
    if (error.response) {
      log(`レスポンスステータス: ${error.response.status}`);
      log(`レスポンスデータ: ${JSON.stringify(error.response.data)}`);
    }
  } finally {
    logStream.end();
  }
}

// 実行
sendTestMessage().catch(console.error);