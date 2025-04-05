/**
 * 全APIテストの一括実行
 */
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const tests = [
  'simple-test-auth.js',
  'simple-test-fortune.js',
  'simple-test-fortune-saju.js',
  'simple-test-fortune-date.js',
  'simple-test-conversation.js',
  'simple-test-subscription.js',
  'simple-test-team.js'
];

async function runAllTests() {
  console.log('==== 全APIテストの一括実行 ====');
  console.log(`テスト数: ${tests.length}\n`);
  
  const results = {
    success: 0,
    failure: 0,
    details: {}
  };
  
  for (const test of tests) {
    console.log(`\n実行中: ${test}...`);
    
    try {
      const { stdout, stderr } = await execPromise(`node ${test}`);
      
      // 成功と判断するための条件を設定
      // 例えば、「success」という単語が含まれている、またはエラーがない場合など
      const isSuccess = !stderr || stderr.trim() === '';
      
      if (isSuccess) {
        console.log(`✅ テスト成功: ${test}`);
        results.success++;
        results.details[test] = {
          status: 'success',
          output: stdout.length > 100 ? stdout.substring(0, 100) + '...' : stdout
        };
      } else {
        console.log(`❌ テスト失敗: ${test}`);
        results.failure++;
        results.details[test] = {
          status: 'failure',
          error: stderr
        };
      }
    } catch (error) {
      console.log(`❌ テスト実行エラー: ${test}`);
      console.error(error.message);
      results.failure++;
      results.details[test] = {
        status: 'error',
        error: error.message
      };
    }
  }
  
  console.log('\n==== テスト実行結果 ====');
  console.log(`成功: ${results.success}/${tests.length}`);
  console.log(`失敗: ${results.failure}/${tests.length}`);
  console.log(`成功率: ${(results.success / tests.length * 100).toFixed(1)}%`);
  
  if (results.failure > 0) {
    console.log('\n失敗したテスト:');
    Object.keys(results.details).forEach(test => {
      if (results.details[test].status !== 'success') {
        console.log(`- ${test}`);
      }
    });
  }
}

runAllTests();