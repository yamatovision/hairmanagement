/**
 * ビルドエラー修正用スクリプト
 * @file type-fix.js
 * 
 * 使用方法: node scripts/type-fix.js
 * 
 * このスクリプトはプロジェクト内のサービスレイヤーの型変換を自動的に修正します。
 * - documentToInterface の適用漏れを検出して追加
 * - @sharedエイリアスの適用漏れを検出して修正
 * - 型変換のないMongooseドキュメント返却箇所を修正
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// プロジェクトのルートディレクトリ
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const SERVICES_DIR = path.join(BACKEND_DIR, 'src', 'services');

// 変換関数のインポート検出パターン
const IMPORT_PATTERN = /documentToInterface|documentsToInterfaces/;
// Mongooseドキュメントの返却パターン
const RETURN_DOCUMENT_PATTERN = /return\s+(\w+)(\.\w+\(\))?\s*;/g;
// 必要なインポートの定義
const MODEL_CONVERTER_IMPORT = "import { documentToInterface, documentsToInterfaces } from '../utils/model-converters';";
const SHARED_IMPORT_PATTERN = /from\s+['"]\.\.\/\.\.\/\.\.\/shared['"]/;
const SHARED_ALIAS_IMPORT = "from '@shared'";

/**
 * サービスファイルの修正
 * @param {string} filePath ファイルパス
 */
function fixServiceFile(filePath) {
  console.log(`処理中: ${path.relative(ROOT_DIR, filePath)}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // インポート修正
  if (!IMPORT_PATTERN.test(content)) {
    // documentToInterfaceのインポートが不足している場合、追加
    const lines = content.split('\n');
    const importInsertionIndex = lines.findIndex(line => /^import/.test(line)) + 1;
    
    // 重複を避けるために、既にインポートされていないか確認
    const hasModelConverterImport = lines.some(line => line.includes('model-converters'));
    
    if (!hasModelConverterImport && importInsertionIndex > 0) {
      lines.splice(importInsertionIndex, 0, MODEL_CONVERTER_IMPORT);
      content = lines.join('\n');
      modified = true;
      console.log(`  - モデル変換インポートを追加`);
    }
  }
  
  // @sharedエイリアスの適用
  if (SHARED_IMPORT_PATTERN.test(content)) {
    content = content.replace(SHARED_IMPORT_PATTERN, `from ${SHARED_ALIAS_IMPORT}`);
    modified = true;
    console.log(`  - @sharedエイリアスを適用`);
  }
  
  // 型変換の追加
  const interfaceTypeMap = {
    'user': 'IUser',
    'fortune': 'IFortune',
    'conversation': 'IConversation',
    'goal': 'IGoal',
    'team': 'ITeamContribution',
    'mentorship': 'IMentorship',
    'analytics': 'IEngagementAnalytics'
  };
  
  // ファイル名から推測されるインターフェース型
  const fileName = path.basename(filePath, '.ts');
  const fileNameParts = fileName.split('.');
  const baseFileName = fileNameParts[0];
  const interfaceType = interfaceTypeMap[baseFileName] || 'any';
  
  // return document; パターンの修正
  let returnMatches;
  let newContent = content;
  
  while ((returnMatches = RETURN_DOCUMENT_PATTERN.exec(content)) !== null) {
    const fullMatch = returnMatches[0];
    const varName = returnMatches[1];
    
    // 既に型変換されているか、変数名が一般的すぎる場合はスキップ
    if (fullMatch.includes('documentToInterface') || ['result', 'value', 'data', 'item', 'response'].includes(varName)) {
      continue;
    }
    
    // モデル名から推測される型
    let typeGuess = interfaceType;
    if (varName.includes('user')) typeGuess = 'IUser';
    else if (varName.includes('fortune')) typeGuess = 'IFortune';
    else if (varName.includes('conversation')) typeGuess = 'IConversation';
    else if (varName.includes('goal')) typeGuess = 'IGoal';
    else if (varName.includes('team')) typeGuess = 'ITeamContribution';
    else if (varName.includes('mentor')) typeGuess = 'IMentorship';
    else if (varName.includes('analytics')) typeGuess = 'IEngagementAnalytics';
    
    // コンテキストベースの置換
    const replacement = `return documentToInterface<${typeGuess}>(${varName});`;
    
    // 置換前に置換箇所を特定し、既に型変換されていないか確認
    const logicalUnitStart = Math.max(0, newContent.lastIndexOf('async', newContent.indexOf(fullMatch)));
    const contextBefore = newContent.substring(logicalUnitStart, newContent.indexOf(fullMatch));
    
    // すでに"documentToInterface"が含まれている場合はスキップ
    if (contextBefore.includes('documentToInterface')) {
      continue;
    }
    
    newContent = newContent.replace(fullMatch, replacement);
    modified = true;
    console.log(`  - 変換追加: "${fullMatch.trim()}" -> "${replacement.trim()}"`);
  }
  
  // 変更があれば保存
  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`  ✅ 変更を保存: ${path.relative(ROOT_DIR, filePath)}`);
  } else {
    console.log(`  ⏭️ 変更なし: ${path.relative(ROOT_DIR, filePath)}`);
  }
}

/**
 * サービスディレクトリ内のファイルを処理
 */
function processServicesDirectory() {
  console.log(`サービスディレクトリを処理中: ${path.relative(ROOT_DIR, SERVICES_DIR)}`);
  
  // サービスディレクトリ内のすべてのTypeScriptファイルを取得
  const serviceFiles = fs.readdirSync(SERVICES_DIR)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(SERVICES_DIR, file));
  
  // 各ファイルを処理
  serviceFiles.forEach(fixServiceFile);
}

/**
 * メイン処理
 */
function main() {
  console.log('🔧 型変換修正スクリプトを実行中...');
  processServicesDirectory();
  console.log('✅ 処理完了');
}

main();