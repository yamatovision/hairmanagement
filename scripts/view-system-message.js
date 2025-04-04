/**
 * システムメッセージ表示スクリプト
 * サーバーログをグレップして四柱推命のシステムメッセージを抽出します
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 検索パターン
const patterns = [
  "送信される四柱推命システムメッセージ",
  "地支十神情報",
  "Claude APIに送信されるリクエスト",
  "メッセージフローを確認します"
];

// 結果表示ファイル
const resultsFile = path.join(__dirname, 'test-logs', 'system-message-results.txt');

// サーバーログの検索
function searchServerLog() {
  console.log('===== サーバーログからシステムメッセージ情報を抽出します =====');
  
  // ログディレクトリを作成（存在しない場合）
  fs.mkdirSync(path.join(__dirname, 'test-logs'), { recursive: true });
  
  // 結果ファイルを初期化
  fs.writeFileSync(resultsFile, `システムメッセージ検索結果\n生成日時: ${new Date().toISOString()}\n\n`);
  
  // 各パターンを検索
  let completed = 0;
  for (const pattern of patterns) {
    console.log(`\n【検索パターン: ${pattern}】`);
    
    // ログファイルパス
    const serverLogPath = path.join('..', 'backend', 'logs', 'server.log');
    
    // ログファイルが存在するか確認
    if (!fs.existsSync(serverLogPath)) {
      console.log(`サーバーログが見つかりません: ${serverLogPath}`);
      appendResults(`パターン: ${pattern}\nログファイルが見つかりません: ${serverLogPath}\n\n`);
      completed++;
      checkCompletion();
      continue;
    }
    
    // grepコマンドを実行
    const grepCmd = `grep -A 20 "${pattern}" ${serverLogPath}`;
    exec(grepCmd, (err, stdout, stderr) => {
      if (err && err.code !== 1) { // grep で結果が見つからない場合、終了コード1が返される
        console.error(`検索エラー: ${err.message}`);
        appendResults(`パターン: ${pattern}\n検索エラー: ${err.message}\n\n`);
      } else {
        console.log(stdout || "情報が見つかりませんでした");
        appendResults(`パターン: ${pattern}\n${stdout || "情報が見つかりませんでした"}\n\n`);
      }
      
      completed++;
      checkCompletion();
    });
  }
  
  // すべての検索が完了したか確認
  function checkCompletion() {
    if (completed === patterns.length) {
      console.log(`\n検索が完了しました。結果は ${resultsFile} に保存されています。`);
    }
  }
}

// 結果をファイルに追記
function appendResults(text) {
  fs.appendFileSync(resultsFile, text);
}

// メイン実行
searchServerLog();