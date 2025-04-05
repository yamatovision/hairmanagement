#!/usr/bin/env node
/**
 * データフローテスト実行スクリプト
 * フェーズ2:データフロー強化のテストを実行するためのスクリプト
 * 
 * 使用方法:
 * npm run test:data-flow
 * または直接実行:
 * node scripts/run-data-flow-tests.js
 * 
 * 作成日: 2025/04/09
 * 作成者: Claude
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// テスト実行の設定
const TEST_DIR = 'src/tests/saju';
const REPORT_DIR = 'reports/tests';
const BACKEND_DIR = path.resolve(__dirname, '../backend');

// バックエンドディレクトリにレポートディレクトリを作成
const FULL_REPORT_DIR = path.join(BACKEND_DIR, REPORT_DIR);

const TEST_FILES = [
  'saju-data-transformer.test.ts',
  'daily-calendar-info-data-flow.test.ts',
  'daily-fortune-data-flow.test.ts',
  'integrated-data-flow.test.ts'
];

// 現在の日時を取得（レポート名に使用）
const now = new Date();
const timestamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
  'T',
  String(now.getHours()).padStart(2, '0'),
  '-',
  String(now.getMinutes()).padStart(2, '0'),
  '-',
  String(now.getSeconds()).padStart(2, '0')
].join('');

// レポートディレクトリの作成
if (!fs.existsSync(FULL_REPORT_DIR)) {
  fs.mkdirSync(FULL_REPORT_DIR, { recursive: true });
  console.log(`レポートディレクトリを作成しました: ${FULL_REPORT_DIR}`);
}

// テスト結果の概要
const testResults = {
  timestamp,
  success: true,
  results: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0
  }
};

console.log('=====================================================');
console.log(' データフロー強化（フェーズ2）テスト実行');
console.log('=====================================================');
console.log(`実行日時: ${timestamp}`);
console.log(`テスト対象: ${TEST_FILES.length}ファイル`);
console.log('-----------------------------------------------------');

// 各テストファイルを実行
TEST_FILES.forEach((testFile, index) => {
  const testFilePath = path.join(TEST_DIR, testFile);
  const reportName = `data-flow-${testFile.replace('.test.ts', '')}-${timestamp}.json`;
  const reportPath = path.join(REPORT_DIR, reportName);
  
  console.log(`[${index + 1}/${TEST_FILES.length}] ${testFile} の実行中...`);
  
  try {
    // テストコマンドの構築
    // --json: JSON形式の出力
    // --outputFile: 結果の出力先
    // --testNamePattern: 特定のテストのみ実行（必要に応じて）
    const reportFullPath = path.join(FULL_REPORT_DIR, reportName);
    const command = `npx jest ${testFilePath} --json --outputFile=${reportFullPath}`;
    
    // テストの実行
    execSync(command, { stdio: 'inherit', cwd: BACKEND_DIR });
    
    // テスト結果の読み込み
    const resultJson = JSON.parse(fs.readFileSync(reportFullPath, 'utf8'));
    testResults.results.push({
      file: testFile,
      success: resultJson.success,
      testResults: resultJson.numPassedTests,
      totalTests: resultJson.numTotalTests,
      failedTests: resultJson.numFailedTests,
      duration: resultJson.testResults[0]?.perfStats?.duration || 0
    });
    
    // 概要の更新
    testResults.summary.total += resultJson.numTotalTests;
    testResults.summary.passed += resultJson.numPassedTests;
    testResults.summary.failed += resultJson.numFailedTests;
    testResults.summary.skipped += (resultJson.numTotalTests - resultJson.numPassedTests - resultJson.numFailedTests);
    testResults.summary.duration += resultJson.testResults[0]?.perfStats?.duration || 0;
    
    // 成功フラグの更新
    if (!resultJson.success) {
      testResults.success = false;
    }
    
    console.log(`  ✓ テスト完了: ${resultJson.numPassedTests}/${resultJson.numTotalTests} 成功`);
  } catch (error) {
    console.error(`  ✗ テスト実行エラー: ${error.message}`);
    testResults.results.push({
      file: testFile,
      success: false,
      error: error.message
    });
    testResults.success = false;
  }
});

// 全体の概要の出力
console.log('-----------------------------------------------------');
console.log('テスト実行結果の概要:');
console.log(`  全テスト数: ${testResults.summary.total}`);
console.log(`  成功: ${testResults.summary.passed}`);
console.log(`  失敗: ${testResults.summary.failed}`);
console.log(`  スキップ: ${testResults.summary.skipped}`);
console.log(`  実行時間: ${(testResults.summary.duration / 1000).toFixed(2)}秒`);
console.log('-----------------------------------------------------');

// 概要レポートの保存
const summaryReportPath = path.join(FULL_REPORT_DIR, `data-flow-summary-${timestamp}.json`);
fs.writeFileSync(summaryReportPath, JSON.stringify(testResults, null, 2));
console.log(`テスト概要レポートを保存しました: ${summaryReportPath}`);

// 結果をステータスコードで返す
process.exit(testResults.success ? 0 : 1);