/**
 * APIテスト実行スクリプト - フェーズ4 テストおよび検証
 * 
 * 主要なAPIエンドポイントのテストを順番に実行し、
 * APIの動作状況を検証します。
 * 
 * 使用方法:
 * node scripts/run-api-tests.js [test1,test2,...] [--verbose]
 * 
 * 例:
 * node scripts/run-api-tests.js all              # すべてのテストを実行
 * node scripts/run-api-tests.js auth,team        # 認証とチームのテストのみ実行
 * node scripts/run-api-tests.js analytics --verbose  # 分析テストを詳細モードで実行
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 利用可能なテスト
const AVAILABLE_TESTS = {
  auth: {
    script: 'test-auth-api.js',
    description: '認証API（ログイン、ユーザー情報取得など）',
    dependsOn: []
  },
  user: {
    script: 'test-user-endpoints.js', 
    description: 'ユーザーAPI（プロフィール取得・更新など）',
    dependsOn: ['auth']
  },
  fortune: {
    script: 'test-fortune-endpoints.js',
    description: '運勢API（日次運勢、週間予報など）',
    dependsOn: ['auth']
  },
  conversation: {
    script: 'test-conversation-endpoints.js',
    description: '会話API（メッセージ送信、履歴取得など）',
    dependsOn: ['auth']
  },
  team: {
    script: 'test-team-endpoints.js',
    description: 'チームAPI（チーム作成、メンバー管理など）',
    dependsOn: ['auth']
  },
  compatibility: {
    script: 'test-team-compatibility.js',
    description: 'チーム相性API（メンバー間の相性、五行バランスなど）',
    dependsOn: ['auth', 'team']
  },
  analytics: {
    script: 'test-analytics-endpoints.js',
    description: '分析API（エンゲージメント、チーム分析など）',
    dependsOn: ['auth']
  }
};

// コマンドライン引数の解析
const args = process.argv.slice(2);
let testsToRun = [];
let verbose = false;

// 引数を解析
args.forEach(arg => {
  if (arg === '--verbose' || arg === '-v') {
    verbose = true;
  } else if (arg === 'all') {
    testsToRun = Object.keys(AVAILABLE_TESTS);
  } else if (arg.includes(',')) {
    testsToRun = [...testsToRun, ...arg.split(',')];
  } else {
    testsToRun.push(arg);
  }
});

// デフォルトですべてのテストを実行
if (testsToRun.length === 0) {
  testsToRun = Object.keys(AVAILABLE_TESTS);
}

// 無効なテスト名をフィルタリング
const invalidTests = testsToRun.filter(test => !AVAILABLE_TESTS[test]);
if (invalidTests.length > 0) {
  console.log(`警告: 次のテストは存在しません: ${invalidTests.join(', ')}`);
  testsToRun = testsToRun.filter(test => AVAILABLE_TESTS[test]);
}

// 依存関係を解決（必要な順序でテストを実行するため）
function resolveDependencies(tests) {
  const result = [];
  const visited = new Set();
  
  function visitTest(test) {
    if (visited.has(test)) return;
    
    // 依存関係を先に訪問
    if (AVAILABLE_TESTS[test].dependsOn) {
      AVAILABLE_TESTS[test].dependsOn.forEach(dep => {
        if (tests.includes(dep)) {
          visitTest(dep);
        }
      });
    }
    
    visited.add(test);
    result.push(test);
  }
  
  // すべてのテストに対して依存関係を解決
  tests.forEach(test => visitTest(test));
  
  return result;
}

// 依存関係を考慮してテストを並べ替え
testsToRun = resolveDependencies(testsToRun);

// 実行するテストの一覧を表示
console.log('===== APIテスト実行スクリプト - フェーズ4 テストおよび検証 =====');
console.log(`実行するテスト: ${testsToRun.length}件`);
testsToRun.forEach((test, index) => {
  console.log(`${index + 1}. ${test} - ${AVAILABLE_TESTS[test].description}`);
});
console.log('');

// テスト結果のサマリー
const results = {
  total: testsToRun.length,
  success: 0,
  failure: 0,
  details: {}
};

// テストを一つずつ実行
async function runTests() {
  for (let i = 0; i < testsToRun.length; i++) {
    const test = testsToRun[i];
    const scriptPath = path.join(__dirname, AVAILABLE_TESTS[test].script);
    
    // テスト実行開始メッセージ
    console.log(`\n----- テスト実行中 (${i + 1}/${testsToRun.length}): ${test} -----`);
    console.log(`スクリプト: ${AVAILABLE_TESTS[test].script}`);
    console.log(`説明: ${AVAILABLE_TESTS[test].description}`);
    
    // スクリプトが存在するか確認
    if (!fs.existsSync(scriptPath)) {
      console.error(`エラー: スクリプトファイルが見つかりません: ${scriptPath}`);
      results.failure++;
      results.details[test] = {
        status: 'error',
        message: 'スクリプトファイルが見つかりません'
      };
      continue;
    }
    
    // テスト実行
    try {
      const result = await runScript(scriptPath, verbose);
      
      if (result.exitCode === 0) {
        console.log(`\n✅ テスト成功: ${test}`);
        results.success++;
        results.details[test] = {
          status: 'success',
          output: result.output
        };
      } else {
        console.log(`\n❌ テスト失敗: ${test} (終了コード: ${result.exitCode})`);
        results.failure++;
        results.details[test] = {
          status: 'failure',
          exitCode: result.exitCode,
          output: result.output
        };
      }
    } catch (error) {
      console.error(`\n❌ テスト実行エラー: ${test}`, error);
      results.failure++;
      results.details[test] = {
        status: 'error',
        message: error.message
      };
    }
  }
  
  // 結果サマリーを表示
  console.log('\n===== テスト結果サマリー =====');
  console.log(`合計: ${results.total}件`);
  console.log(`成功: ${results.success}件`);
  console.log(`失敗: ${results.failure}件`);
  console.log('');
  
  // 失敗したテストがあれば詳細を表示
  if (results.failure > 0) {
    console.log('失敗したテスト:');
    Object.keys(results.details).forEach(test => {
      if (results.details[test].status !== 'success') {
        console.log(`- ${test}: ${results.details[test].message || results.details[test].status}`);
      }
    });
    
    // 終了コードを非ゼロに設定（CIでの使用を想定）
    process.exitCode = 1;
  } else {
    console.log('すべてのテストが成功しました！');
  }
  
  // 結果をファイルに保存
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const resultFile = path.join(__dirname, '..', 'reports', 'tests', `api-test-summary-${timestamp}.json`);
  
  // reports/testsディレクトリが存在することを確認
  const reportsDir = path.join(__dirname, '..', 'reports');
  const testsDir = path.join(reportsDir, 'tests');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }
  
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir);
  }
  
  // 結果を保存
  fs.writeFileSync(resultFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      success: results.success,
      failure: results.failure
    },
    tests: results.details
  }, null, 2));
  
  console.log(`\n結果の詳細は以下に保存されました: ${resultFile}`);
}

/**
 * スクリプトを実行して結果を返す
 * @param {string} scriptPath - 実行するスクリプトのパス
 * @param {boolean} verbose - 詳細出力するかどうか
 * @returns {Promise<{exitCode: number, output: string}>} - 実行結果
 */
function runScript(scriptPath, verbose) {
  return new Promise((resolve, reject) => {
    // Nodeプロセスを起動
    const child = spawn('node', [scriptPath]);
    
    let output = '';
    
    // 標準出力の処理
    child.stdout.on('data', (data) => {
      const text = data.toString();
      if (verbose) {
        process.stdout.write(text);
      } else {
        // 進捗表示のみ出力（詳細モードでない場合）
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.includes('テスト') && (line.includes('開始') || line.includes('完了'))) {
            console.log(line);
          } else if (line.includes('成功') || line.includes('失敗')) {
            console.log(line);
          }
        });
      }
      output += text;
    });
    
    // 標準エラー出力の処理
    child.stderr.on('data', (data) => {
      const text = data.toString();
      // エラーは常に表示
      process.stderr.write(text);
      output += text;
    });
    
    // プロセス終了時の処理
    child.on('close', (code) => {
      resolve({
        exitCode: code,
        output
      });
    });
    
    // エラー処理
    child.on('error', (error) => {
      reject(error);
    });
  });
}

// テスト実行開始
runTests().catch(error => {
  console.error('テスト実行中にエラーが発生しました:', error);
  process.exitCode = 1;
});