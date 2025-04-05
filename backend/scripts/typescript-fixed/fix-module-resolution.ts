/**
 * モジュール解決エラー (TS2307) の修正スクリプト
 * 
 * 問題: Cannot find module '../../utils/logger.util' or its corresponding type declarations.
 * 原因: 相対パスが正しくないか、モジュールが存在しない
 * 解決策: パスエイリアスへの変更または相対パスの修正
 * 
 * 使用方法:
 * 1. このスクリプトを実行して対象ファイルを特定
 * 2. 修正方法に従って手動で修正を適用
 * 
 * 作成日: 2025/04/05
 */

import * as fs from 'fs';
import * as path from 'path';

// プロジェクトルートからの相対パス
const SRC_DIR = path.resolve(__dirname, '../../src');

// パスエイリアスのマッピング
const PATH_ALIASES: Record<string, string> = {
  '@utils': 'utils',
  '@domain': 'domain',
  '@application': 'application',
  '@infrastructure': 'infrastructure',
  '@interfaces': 'interfaces',
  '@shared': 'shared',
  '@config': 'config'
};

// モジュール解決エラーを検出する正規表現
const IMPORT_REGEX = /import\s+(?:(?:{[^}]*})|(?:[^{}\s]+))\s+from\s+['"]([^'"]+)['"]/g;
const RELATIVE_PATH_REGEX = /^\.\.\/+/;

// 対象とするディレクトリ
const ARCHIVE_DIR = path.join(SRC_DIR, 'application/services/archive');

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
 * import文を解析して問題のあるインポートを特定
 */
function analyzeImports(filePath: string): { filePath: string; importPath: string; line: string; lineNumber: number }[] {
  const issues: { filePath: string; importPath: string; line: string; lineNumber: number }[] = [];
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const importMatches = Array.from(line.matchAll(IMPORT_REGEX));
    
    importMatches.forEach(match => {
      const importPath = match[1];
      
      // 相対パスのみ処理
      if (RELATIVE_PATH_REGEX.test(importPath)) {
        // 潜在的な問題のあるインポートを検出
        // 典型的なパターンは '../../utils/logger.util' などの深い相対パス
        const pathDepth = (importPath.match(/\.\.\//g) || []).length;
        
        if (pathDepth > 1) {
          issues.push({
            filePath,
            importPath,
            line,
            lineNumber: index + 1
          });
        }
      }
    });
  });
  
  return issues;
}

/**
 * パスエイリアスに置き換えられるかテスト
 */
function suggestPathAlias(importPath: string, filePath: string): string | null {
  const relativePath = importPath.replace(RELATIVE_PATH_REGEX, '');
  const segments = relativePath.split('/');
  
  if (segments.length < 2) return null;
  
  const rootDir = segments[0];
  
  // パスエイリアスを検索
  for (const [alias, dir] of Object.entries(PATH_ALIASES)) {
    if (dir === rootDir) {
      return `${alias}/${segments.slice(1).join('/')}`;
    }
  }
  
  return null;
}

/**
 * 相対パスを修正
 */
function fixRelativePath(importPath: string, filePath: string): string {
  // ファイルの親ディレクトリを取得
  const fileDir = path.dirname(filePath);
  
  // インポートパスを解析
  const cleanImportPath = importPath.replace(RELATIVE_PATH_REGEX, '');
  
  // srcディレクトリからの相対パスを計算
  const relativeToBuildTarget = path.relative(fileDir, SRC_DIR);
  const targetPath = path.join(relativeToBuildTarget, cleanImportPath);
  
  // 最終的なパスを整形
  return `./${targetPath.replace(/\\/g, '/')}`;
}

/**
 * メイン関数
 */
function main() {
  console.log('モジュール解決エラー修正スクリプトを実行中...');
  
  // 1. 全TSファイルを取得
  console.log('ソースファイルをスキャン中...');
  const files = getAllTsFiles(ARCHIVE_DIR);
  console.log(`${files.length}個のTypeScriptファイルが見つかりました`);
  
  // 2. 各ファイルのインポートを解析
  let allIssues: { filePath: string; importPath: string; line: string; lineNumber: number }[] = [];
  
  files.forEach(file => {
    const issues = analyzeImports(file);
    allIssues = [...allIssues, ...issues];
  });
  
  console.log(`${allIssues.length}個の潜在的な問題のあるインポートが見つかりました`);
  
  // 3. 修正提案を生成
  allIssues.forEach(issue => {
    const { filePath, importPath, line, lineNumber } = issue;
    const relativeFilePath = path.relative(SRC_DIR, filePath);
    
    console.log(`\nファイル: ${relativeFilePath}`);
    console.log(`行 ${lineNumber}: ${line.trim()}`);
    
    // パスエイリアスの提案
    const aliasPath = suggestPathAlias(importPath, filePath);
    if (aliasPath) {
      console.log(`パスエイリアス修正: ${importPath} -> ${aliasPath}`);
    }
    
    // 相対パスの修正
    const fixedPath = fixRelativePath(importPath, filePath);
    console.log(`相対パス修正: ${importPath} -> ${fixedPath}`);
  });
  
  // 4. tsconfig.jsonのパスエイリアス設定を確認
  const tsconfigPath = path.resolve(__dirname, '../../tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      const hasPathsConfig = tsconfig.compilerOptions && tsconfig.compilerOptions.paths;
      
      if (!hasPathsConfig) {
        console.log('\ntsconfig.jsonにpaths設定がありません。以下の設定の追加を検討してください:');
        console.log(`{
  "compilerOptions": {
    ...
    "baseUrl": "src",
    "paths": {
      "@utils/*": ["utils/*"],
      "@domain/*": ["domain/*"],
      "@application/*": ["application/*"],
      "@infrastructure/*": ["infrastructure/*"],
      "@interfaces/*": ["interfaces/*"],
      "@shared/*": ["shared/*"],
      "@config/*": ["config/*"]
    }
  }
}`);
      }
    } catch (error) {
      console.error('tsconfig.jsonの解析に失敗しました:', error);
    }
  }
  
  console.log('\n修正手順:');
  console.log('1. パスエイリアスを使用する場合、tsconfig.jsonに適切なpaths設定があることを確認');
  console.log('2. 上記の提案を参考に、各ファイルのインポートパスを修正');
  console.log('3. コンパイルエラーが解消されたことをtscコマンドで確認');
}

// スクリプト実行
main();