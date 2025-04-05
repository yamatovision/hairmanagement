/**
 * 暗黙的any型の使用 (TS7006) の修正スクリプト
 * 
 * 問題: Parameter '...' implicitly has an 'any' type.
 * 原因: 関数パラメータに型アノテーションがない
 * 解決策: 適切な型アノテーションの追加
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

// 暗黙的any型を検出する正規表現
const FUNCTION_PARAM_REGEX = /(?:function|constructor|method)\s+(\w+)?\s*\(([^)]*)\)/g;
const ARROW_FUNCTION_REGEX = /(?:const|let|var)?\s*(\w+)?\s*(?:=|:)\s*(?:\([^)]*\)|[^=>(]*)\s*=>\s*{/g;
const CALLBACK_PARAM_REGEX = /\(\s*(\w+)(?:\s*,\s*(\w+))*\s*\)\s*=>/g;

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
 * 関数パラメータを解析して型アノテーションのないパラメータを特定
 */
function analyzeParameters(filePath: string): { filePath: string; functionName: string; line: string; lineNumber: number; params: string[] }[] {
  const issues: { filePath: string; functionName: string; line: string; lineNumber: number; params: string[] }[] = [];
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // 関数宣言を探す
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 通常の関数とメソッド
    const funcMatches = Array.from(line.matchAll(FUNCTION_PARAM_REGEX));
    funcMatches.forEach(match => {
      const functionName = match[1] || 'anonymous';
      const params = match[2]
        .split(',')
        .map(p => p.trim())
        .filter(p => p !== '')
        .filter(p => !p.includes(':')) // 型アノテーションがないパラメータをフィルタ
        .map(p => p.replace(/[={}[\]]/g, '').trim()); // デフォルト値を削除
      
      if (params.length > 0) {
        issues.push({
          filePath,
          functionName,
          line,
          lineNumber: i + 1,
          params
        });
      }
    });
    
    // アロー関数
    const arrowMatches = Array.from(line.matchAll(ARROW_FUNCTION_REGEX));
    arrowMatches.forEach(match => {
      const functionName = match[1] || 'anonymous';
      
      // アロー関数のパラメータを探す
      const callbackMatches = Array.from(line.matchAll(CALLBACK_PARAM_REGEX));
      let params: string[] = [];
      
      callbackMatches.forEach(cbMatch => {
        for (let j = 1; j < cbMatch.length; j++) {
          if (cbMatch[j]) {
            params.push(cbMatch[j].trim());
          }
        }
      });
      
      params = params.filter(p => p !== '' && !line.includes(`${p}:`));
      
      if (params.length > 0) {
        issues.push({
          filePath,
          functionName,
          line,
          lineNumber: i + 1,
          params
        });
      }
    });
  }
  
  return issues;
}

/**
 * 関数の使用コンテキストから型を推測
 */
function suggestParameterTypes(filePath: string, functionName: string, paramNames: string[]): Record<string, string> {
  const typeMap: Record<string, string> = {};
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 基本的なパラメータの型推測
  paramNames.forEach(param => {
    // 一般的な命名規則に基づく型の推測
    if (param.includes('id') || param.endsWith('Id')) {
      typeMap[param] = 'string';
    } else if (param === 'req' || param === 'request') {
      typeMap[param] = 'Request';
    } else if (param === 'res' || param === 'response') {
      typeMap[param] = 'Response';
    } else if (param === 'err' || param === 'error') {
      typeMap[param] = 'Error';
    } else if (param === 'data') {
      typeMap[param] = 'Record<string, unknown>';
    } else if (param === 'options') {
      typeMap[param] = 'Record<string, unknown>';
    } else if (param === 'item' || param === 'element') {
      typeMap[param] = 'unknown';
    } else if (param === 'index' || param === 'i') {
      typeMap[param] = 'number';
    } else if (param === 'callback') {
      typeMap[param] = '() => void';
    } else {
      typeMap[param] = 'unknown';
    }
  });
  
  return typeMap;
}

/**
 * 型アノテーションを追加した修正例を生成
 */
function generateTypeAnnotationExample(line: string, params: string[], typeMap: Record<string, string>): string {
  let modifiedLine = line;
  
  // 各パラメータの型アノテーションを追加
  params.forEach(param => {
    const type = typeMap[param] || 'unknown';
    // パラメータ名の後に型アノテーションを追加
    modifiedLine = modifiedLine.replace(
      new RegExp(`\\b${param}\\b(?![\\s\\S]*:)(?![\\s\\S]*=>)`, 'g'),
      `${param}: ${type}`
    );
  });
  
  return modifiedLine;
}

/**
 * メイン関数
 */
function main() {
  console.log('暗黙的any型の修正スクリプトを実行中...');
  
  // 1. 全TSファイルを取得
  console.log('ソースファイルをスキャン中...');
  const files = getAllTsFiles(SRC_DIR);
  console.log(`${files.length}個のTypeScriptファイルが見つかりました`);
  
  // 2. 各ファイルの関数パラメータを解析
  let allIssues: { filePath: string; functionName: string; line: string; lineNumber: number; params: string[] }[] = [];
  
  files.forEach(file => {
    const issues = analyzeParameters(file);
    allIssues = [...allIssues, ...issues];
  });
  
  console.log(`${allIssues.length}個の暗黙的any型のパラメータが見つかりました`);
  
  // 3. 修正提案を生成
  allIssues.forEach(issue => {
    const { filePath, functionName, line, lineNumber, params } = issue;
    const relativeFilePath = path.relative(SRC_DIR, filePath);
    
    console.log(`\nファイル: ${relativeFilePath}`);
    console.log(`行 ${lineNumber}: ${line.trim()}`);
    console.log(`関数名: ${functionName}`);
    console.log(`型アノテーションのないパラメータ: ${params.join(', ')}`);
    
    // 型提案
    const typeMap = suggestParameterTypes(filePath, functionName, params);
    const paramTypes = params.map(p => `${p}: ${typeMap[p] || 'unknown'}`).join(', ');
    console.log(`型提案: ${paramTypes}`);
    
    // 修正例
    const modifiedLine = generateTypeAnnotationExample(line.trim(), params, typeMap);
    console.log('\n修正例:');
    console.log(modifiedLine);
  });
  
  // 4. 関連するインポートの提案
  const commonImports = [
    "import { Request, Response } from 'express';",
    "import { Result } from '../shared/utils/result.util';",
    "import { Document } from 'mongoose';"
  ];
  
  console.log('\n必要に応じて以下のインポートを追加:');
  commonImports.forEach(imp => console.log(imp));
  
  console.log('\n修正手順:');
  console.log('1. 上記の修正提案を参考に、各ファイルのパラメータに型アノテーションを追加');
  console.log('2. 必要に応じて、インポート文を追加');
  console.log('3. コンパイルエラーが解消されたことをtscコマンドで確認');
  console.log('4. より具体的な型が判明した場合は、unknown型から適切な型に更新');
}

// スクリプト実行
main();