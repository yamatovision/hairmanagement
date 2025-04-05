/**
 * unknown型のエラー処理 (TS18046) の修正スクリプト
 * 
 * 問題: 'error' is of type 'unknown'.
 * 原因: try-catchブロック内でのエラー処理で、TypeScript 4.4以降でcatchの変数はunknown型になる
 * 解決策: 型ガードの実装またはResult型の使用
 * 
 * 使用方法:
 * 1. このスクリプトを実行して対象ファイルを特定
 * 2. 修正パターンに従って手動で修正を適用
 * 
 * 作成日: 2025/04/05
 */

import * as fs from 'fs';
import * as path from 'path';

// プロジェクトルートからの相対パス
const SRC_DIR = path.resolve(__dirname, '../../src');

// unknown型エラーを検出する正規表現
const CATCH_ERROR_REGEX = /catch\s*\(\s*(\w+)\s*\)\s*{/g;
const ERROR_USAGE_REGEX = /\b(error|err)\b\s*(\.\s*\w+|\[|\()/g;

/**
 * 特定ディレクトリ内のすべてのTypeScriptファイルを再帰的に取得
 */
function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * try-catchブロックを解析して問題のあるエラー処理を特定
 */
function analyzeErrorHandling(filePath: string): { filePath: string; errorVar: string; line: string; lineNumber: number; usage: string[] }[] {
  const issues: { filePath: string; errorVar: string; line: string; lineNumber: number; usage: string[] }[] = [];
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // catch節を探す
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const catchMatches = Array.from(line.matchAll(CATCH_ERROR_REGEX));
    
    catchMatches.forEach(match => {
      const errorVar = match[1]; // エラー変数名
      
      // そのcatchブロック内でのエラー変数の使用を探す
      const usageLines: string[] = [];
      let braceCount = 1;
      let j = i + 1;
      
      while (j < lines.length && braceCount > 0) {
        const currentLine = lines[j];
        
        // 波括弧のカウント
        braceCount += (currentLine.match(/{/g) || []).length;
        braceCount -= (currentLine.match(/}/g) || []).length;
        
        // エラー変数の使用を検出
        if (currentLine.includes(errorVar) && 
            (currentLine.includes(`.${errorVar}`) || 
             currentLine.match(new RegExp(`\\b${errorVar}\\b\\s*(\\.\\s*\\w+|\\[|\\()`)))) {
          usageLines.push(currentLine.trim());
        }
        
        j++;
      }
      
      if (usageLines.length > 0) {
        issues.push({
          filePath,
          errorVar,
          line,
          lineNumber: i + 1,
          usage: usageLines
        });
      }
    });
  }
  
  return issues;
}

/**
 * Result型を使った修正例を生成
 */
function generateResultExample(errorVar: string): string {
  return `try {
  const result = await someFunction();
  return Result.success(result);
} catch (${errorVar}) {
  // エラー型のチェックとキャスト
  if (${errorVar} instanceof Error) {
    console.error(\`操作に失敗しました: \${${errorVar}.message}\`);
    return Result.failure(${errorVar});
  }
  // unknownエラーの場合は汎用エラーに変換
  const genericError = new Error(\`不明なエラーが発生しました: \${String(${errorVar})}\`);
  return Result.failure(genericError);
}`;
}

/**
 * 型ガードを使った修正例を生成
 */
function generateTypeGuardExample(errorVar: string): string {
  return `try {
  // 通常の処理
} catch (${errorVar}) {
  // 型ガードを使用してエラーをチェック
  if (${errorVar} instanceof Error) {
    console.error(\`エラーが発生しました: \${${errorVar}.message}\`);
    // 型安全にエラーのプロパティにアクセス可能
  } else {
    // unknownの場合の処理
    console.error('不明なエラーが発生しました:', ${errorVar});
  }
}`;
}

/**
 * asアサーションを使った修正例を生成
 */
function generateAssertionExample(errorVar: string): string {
  return `try {
  // 通常の処理
} catch (${errorVar}) {
  // 型アサーションを使用
  const typedError = ${errorVar} as Error;
  console.error(\`エラーが発生しました: \${typedError.message}\`);
  
  // ただし、必要な場合は事前チェックを推奨
  // if (typeof ${errorVar} === 'object' && ${errorVar} !== null && 'message' in ${errorVar}) {
  //   console.error(\`エラーが発生しました: \${(${errorVar} as Error).message}\`);
  // }
}`;
}

/**
 * メイン関数
 */
function main() {
  console.log('unknown型のエラー処理修正スクリプトを実行中...');
  
  // 1. 全TSファイルを取得
  console.log('ソースファイルをスキャン中...');
  const files = getAllTsFiles(SRC_DIR);
  console.log(`${files.length}個のTypeScriptファイルが見つかりました`);
  
  // 2. 各ファイルのエラー処理を解析
  let allIssues: { filePath: string; errorVar: string; line: string; lineNumber: number; usage: string[] }[] = [];
  
  files.forEach(file => {
    const issues = analyzeErrorHandling(file);
    allIssues = [...allIssues, ...issues];
  });
  
  console.log(`${allIssues.length}個の潜在的な問題のあるエラー処理が見つかりました`);
  
  // 3. 修正提案を生成
  allIssues.forEach(issue => {
    const { filePath, errorVar, line, lineNumber, usage } = issue;
    const relativeFilePath = path.relative(SRC_DIR, filePath);
    
    console.log(`\nファイル: ${relativeFilePath}`);
    console.log(`行 ${lineNumber}: ${line.trim()}`);
    console.log(`エラー変数 '${errorVar}' の問題のある使用:`);
    
    usage.forEach(line => {
      console.log(`- ${line}`);
    });
    
    console.log('\n修正パターン 1: Result型を使用 (推奨)');
    console.log(generateResultExample(errorVar));
    
    console.log('\n修正パターン 2: 型ガードを使用');
    console.log(generateTypeGuardExample(errorVar));
    
    console.log('\n修正パターン 3: 型アサーションを使用 (必要な場合のみ)');
    console.log(generateAssertionExample(errorVar));
  });
  
  // 4. result.util.tsファイルの存在確認
  const resultUtilPath = path.join(SRC_DIR, 'shared/utils/result.util.ts');
  if (fs.existsSync(resultUtilPath)) {
    console.log('\nresult.util.tsが存在するため、Result型パターンの使用をお勧めします。');
  } else {
    console.log('\nresult.util.tsが見つかりません。Result型パターンを使用するには、このユーティリティファイルを作成してください。');
  }
  
  console.log('\n修正手順:');
  console.log('1. 上記の修正パターンを参考に、各ファイルのエラー処理を修正');
  console.log('2. 可能な限りResult型パターンを使用して一貫性を保つ');
  console.log('3. コンパイルエラーが解消されたことをtscコマンドで確認');
}

// スクリプト実行
main();