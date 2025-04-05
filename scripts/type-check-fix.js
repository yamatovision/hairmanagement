/**
 * TypeScriptエラー修正支援スクリプト
 * 
 * プロジェクト内のTypeScriptエラーをスキャンし、修正方法の提案を行います。
 * 
 * 使用法:
 * node type-check-fix.js [パス]
 * 
 * 作成日: 2025/04/05
 * 更新日: 2025/04/05 - エラー分析と修正方法を強化
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 対象パス（指定がなければbackendとfrontendをスキャン）
const targetPath = process.argv[2] || '';

// エラーパターンと修正方法のマッピング
const errorPatterns = [
  {
    pattern: /Property 'isSuccess' does not exist/,
    suggestion: 'Result型の適切な使用: 値が直接ではなくResult型でラップされています。先に isSuccess チェックと getValue() を使用してください。'
  },
  {
    pattern: /Property 'getValue' does not exist/,
    suggestion: 'Result型の適切な使用: Result.isSuccess チェック後に getValue() メソッドを使用してください。'
  },
  {
    pattern: /Property '.*' does not exist on type 'never'/,
    suggestion: '型判定後のアクセス: 型がneverになっています。適切な型ガードを使用してください。'
  },
  {
    pattern: /Cannot find module '@shared'/,
    suggestion: 'パスエイリアスの問題: tsconfig.jsonのpaths設定を確認してください。'
  },
  {
    pattern: /Type '(.*)' is not assignable to type '(.*)'/,
    suggestion: '型の不一致: 型の変換またはキャストを検討してください。'
  },
  {
    pattern: /Object is possibly 'null' or 'undefined'/,
    suggestion: 'null/undefinedチェック: オプショナルチェイニング(?.)またはnullishコアレッシング(??)演算子を使用してください。'
  },
  {
    pattern: /Argument of type '(.*)' is not assignable to parameter of type '(.*)'/,
    suggestion: '型の不一致: 引数の型を確認し、適切な型に変換してください。'
  },
  {
    pattern: /Property '(.*)' is missing in type '(.*)'/,
    suggestion: '必須プロパティの欠如: 指定されたプロパティを追加するか、型定義を修正してください。'
  },
  {
    pattern: /Element implicitly has an 'any' type because expression of type/,
    suggestion: 'インデックスアクセス問題: オブジェクトのキーが正しい型であることを確認するか、型アサーション (as KeyType) を使用してください。'
  },
  {
    pattern: /No index signature with a parameter of type 'string' was found/,
    suggestion: 'インデックスシグネチャ問題: 文字列キーに対して型アサーション (as KeyType) を追加してください。例: obj[key as KeyType]'
  },
  {
    pattern: /Type '.*' is missing the following properties from type 'SajuProfile'/,
    suggestion: 'SajuProfileクラス不一致: SajuProfileクラスのインスタンス化には、getSimpleExpression()とtoPlain()メソッドが必要です。ファクトリメソッドまたはコンストラクタを使用してください。'
  }
];

/**
 * 型チェックを実行
 * @param {string} directory スキャン対象ディレクトリ
 * @returns {Promise<string>} エラー出力
 */
async function runTypeCheck(directory) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`${directory}ディレクトリの型チェックを実行中...`));
    
    const tsc = spawn('npx', ['tsc', '--noEmit'], { 
      shell: true,
      cwd: path.join(process.cwd(), directory) 
    });
    
    let output = '';
    
    tsc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    tsc.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    tsc.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green(`✅ ${directory}の型チェックが完了しました - エラーなし`));
        resolve('');
      } else {
        console.log(chalk.yellow(`⚠️ ${directory}の型チェックが完了しました - エラーあり`));
        resolve(output);
      }
    });
    
    tsc.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * エラーをパースして分析
 * @param {string} output tscコマンドの出力
 * @returns {object[]} 分析結果
 */
function parseErrors(output) {
  const errors = [];
  const lines = output.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('error TS')) continue;
    
    const match = line.match(/(.+)\((\d+),(\d+)\): error TS(\d+): (.+)/);
    if (match) {
      const [_, filePath, lineNumber, column, errorCode, message] = match;
      
      // エラーパターンマッチング
      let suggestion = '';
      for (const pattern of errorPatterns) {
        if (pattern.pattern.test(message)) {
          suggestion = pattern.suggestion;
          break;
        }
      }
      
      errors.push({
        filePath: filePath.trim(),
        lineNumber: parseInt(lineNumber),
        column: parseInt(column),
        errorCode,
        message,
        suggestion
      });
    }
  }
  
  return errors;
}

/**
 * エラーをファイルパスごとにグループ化
 * @param {object[]} errors エラーリスト
 * @returns {object} グループ化されたエラー
 */
function groupErrorsByFile(errors) {
  const groups = {};
  
  for (const error of errors) {
    if (!groups[error.filePath]) {
      groups[error.filePath] = [];
    }
    groups[error.filePath].push(error);
  }
  
  return groups;
}

/**
 * エラーを修正方法別にグループ化
 * @param {object[]} errors エラーリスト
 * @returns {object} グループ化されたエラー
 */
function groupErrorsBySuggestion(errors) {
  const groups = {};
  
  for (const error of errors) {
    if (!groups[error.suggestion]) {
      groups[error.suggestion] = [];
    }
    groups[error.suggestion].push(error);
  }
  
  return groups;
}

/**
 * 修正ガイドを生成
 * @param {object} errorGroups グループ化されたエラー
 * @returns {string} 修正ガイド
 */
function generateFixGuide(errorGroups) {
  let guide = chalk.bold('# TypeScriptエラー修正ガイド\n\n');
  
  const totalErrors = Object.values(errorGroups).reduce((sum, errors) => sum + errors.length, 0);
  guide += chalk.bold(`全部で ${totalErrors} 個のエラーが見つかりました。\n\n`);
  
  for (const [suggestion, errors] of Object.entries(errorGroups)) {
    if (!suggestion) continue;
    
    guide += chalk.yellow(`## ${suggestion} (${errors.length}件)\n\n`);
    
    // 最初の5件のエラーを表示
    const sampleErrors = errors.slice(0, 5);
    for (const error of sampleErrors) {
      guide += chalk.cyan(`- ${error.filePath}:${error.lineNumber} - ${error.message}\n`);
    }
    
    if (errors.length > 5) {
      guide += `  ... 他 ${errors.length - 5} 件\n`;
    }
    
    guide += '\n';
  }
  
  // その他（カテゴリ化できなかった）エラー
  const uncategorizedErrors = errorGroups[''] || [];
  if (uncategorizedErrors.length > 0) {
    guide += chalk.yellow(`## その他のエラー (${uncategorizedErrors.length}件)\n\n`);
    
    // 最初の5件のエラーを表示
    const sampleErrors = uncategorizedErrors.slice(0, 5);
    for (const error of sampleErrors) {
      guide += chalk.cyan(`- ${error.filePath}:${error.lineNumber} - ${error.message}\n`);
    }
    
    if (uncategorizedErrors.length > 5) {
      guide += `  ... 他 ${uncategorizedErrors.length - 5} 件\n`;
    }
  }
  
  guide += '\n' + chalk.bold('詳細な修正方法については docs/typescript-error-fix.md を参照してください。');
  
  return guide;
}

/**
 * 特定のファイルのエラー詳細ガイドを生成
 * @param {string} filePath 対象ファイルパス
 * @param {object[]} errors エラーリスト
 * @returns {string} 修正ガイド
 */
function generateFileSpecificGuide(filePath, errors) {
  let guide = `# ${path.basename(filePath)} エラー修正ガイド\n\n`;
  
  guide += `## 概要\n`;
  guide += `- ファイル: ${filePath}\n`;
  guide += `- エラー数: ${errors.length}\n\n`;
  
  guide += `## エラー一覧と修正方法\n\n`;
  
  // エラーコードでソート
  errors.sort((a, b) => a.lineNumber - b.lineNumber);
  
  for (const error of errors) {
    guide += `### 行 ${error.lineNumber}: ${error.message}\n\n`;
    
    // エラータイプによる具体的な修正アドバイス
    if (error.errorCode === '2307') { // モジュールが見つからない
      guide += `**修正方法**: インポートパスを確認してください。パスエイリアス(@など)を使用する場合はtsconfig.jsonのpaths設定が必要です。\n\n`;
    } 
    else if (error.errorCode === '2339') { // プロパティが存在しない
      guide += `**修正方法**: 対象オブジェクトの型を確認し、プロパティへのアクセス前に型ガードを使用してください。\n\n`;
      guide += `\`\`\`typescript\n// 修正例\nif (obj && 'property' in obj) {\n  // obj.property にアクセス\n}\n\`\`\`\n\n`;
    }
    else if (error.errorCode === '2345') { // 引数の型が不一致
      guide += `**修正方法**: 引数の型を対象の型に合わせて変換してください。型アサーションを使用する場合は注意が必要です。\n\n`;
      guide += `\`\`\`typescript\n// 修正例 - 文字列を特定の型として扱う場合\nfunction(value as SpecificType);\n\`\`\`\n\n`;
    }
    else if (error.errorCode === '7053') { // インデックスアクセスの型不一致
      guide += `**修正方法**: オブジェクトのキーアクセス時に型を明示してください。\n\n`;
      guide += `\`\`\`typescript\n// 修正例\nconst value = obj[key as KeyType];\n\n// または、アクセス前に存在確認\nif (Object.hasOwn(obj, key)) {\n  const value = obj[key as KeyType];\n}\n\`\`\`\n\n`;
    }
    else if (error.errorCode === '2739') { // クラスメソッドが不足
      guide += `**修正方法**: SajuProfileクラスを直接インスタンス化せず、ファクトリメソッドを使用するか、クラスのインスタンスを適切に生成してください。\n\n`;
      guide += `\`\`\`typescript\n// 修正例 - 新しいSajuProfileインスタンスを作成\nimport { SajuProfile } from '../domain/user/value-objects/saju-profile';\nconst profile = new SajuProfile(\n  data.fourPillars,\n  data.mainElement as ElementType,\n  data.yinYang as YinYangType,\n  data.tenGods,\n  data.branchTenGods\n);\n\`\`\`\n\n`;
    }
    else {
      guide += `**修正方法**: ${error.suggestion || 'コードの型を確認し、必要に応じて型アノテーションまたはアサーションを追加してください。'}\n\n`;
    }
  }
  
  guide += `## 一般的な修正パターン\n\n`;
  guide += `1. **型アサーション**:\n   文字列やany型を特定の型として扱いたい場合に使用します。\n   \`const typedValue = value as SpecificType;\`\n\n`;
  guide += `2. **型ガード**:\n   条件分岐前に型を確認することで、TypeScriptに型を理解させます。\n   \`if (typeof value === 'string') { /* valueは文字列として扱われる */ }\`\n\n`;
  guide += `3. **オプショナルチェイニング**:\n   null/undefinedの可能性があるプロパティにアクセスする場合に使用します。\n   \`const value = obj?.property;\`\n\n`;
  
  return guide;
}

/**
 * システムメッセージビルダーサービスの修正手順を生成
 */
function generateSystemMessageBuilderFix() {
  let guide = `# system-message-builder.service.ts 修正ガイド\n\n`;
  
  guide += `## 主なエラー内容と修正方針\n\n`;
  guide += `1. **オブジェクトインデックスの型安全性**\n`;
  guide += `   - エラー例: \`Element implicitly has an 'any' type because expression of type 'any' can't be used to index type...\`\n`;
  guide += `   - 原因: 文字列キーを使ってオブジェクトにアクセスする際に型の安全性が確保されていません\n`;
  guide += `   - 修正方法: キーに型アサーションを追加する\n\n`;
  
  guide += `   \`\`\`typescript\n   // 修正前\n   elementalDistribution[element]++;\n   \n   // 修正後\n   elementalDistribution[element as ElementType]++;\n   \`\`\`\n\n`;
  
  guide += `2. **SajuProfile型の不足プロパティ**\n`;
  guide += `   - エラー例: \`Type '{ ... }' is missing the following properties from type 'SajuProfile': getSimpleExpression, toPlain\`\n`;
  guide += `   - 原因: 生のオブジェクトをSajuProfile型として扱っていますが、必要なメソッドが不足しています\n`;
  guide += `   - 修正方法: SajuProfileクラスのインスタンスを適切に生成する\n\n`;
  
  guide += `   \`\`\`typescript\n   // 修正前\n   user = {\n     ...user,\n     sajuProfile: {\n       ...user.sajuProfile,\n       branchTenGods\n     }\n   };\n   \n   // 修正後 - ファクトリ関数を使用\n   import { createSajuProfile } from '../../domain/user/factories/saju-profile.factory';\n   \n   const enhancedSajuProfile = createSajuProfile({\n     ...user.sajuProfile,\n     branchTenGods\n   });\n   \n   user = {\n     ...user,\n     sajuProfile: enhancedSajuProfile\n   };\n   \`\`\`\n\n`;
  
  guide += `3. **型アサーションの追加**\n`;
  guide += `   - 文字列パラメータをElementType, YinYangType, CelestialStemなどの特定の型として扱う場合\n\n`;
  
  guide += `   \`\`\`typescript\n   // 修正前\n   mainElement: userMainElement,\n   \n   // 修正後\n   mainElement: userMainElement as ElementType,\n   \`\`\`\n\n`;
  
  guide += `## ファクトリ関数のサンプル実装\n\n`;
  guide += `\`\`\`typescript\n// domain/user/factories/saju-profile.factory.ts\n\nimport { SajuProfile } from '../value-objects/saju-profile';\nimport { \n  CelestialStem, \n  ElementType,\n  YinYangType,\n  FourPillars,\n  TenGodMap,\n  PillarType,\n  TenGodType \n} from '../../../shared/types/saju';\n\n/**\n * SajuProfileのファクトリ関数\n * プレーンオブジェクトからSajuProfileインスタンスを生成\n */\nexport function createSajuProfile(data: any): SajuProfile {\n  return new SajuProfile(\n    data.fourPillars,\n    data.mainElement as ElementType,\n    data.yinYang as YinYangType,\n    data.tenGods || {} as Record<PillarType, TenGodType>,\n    data.branchTenGods || {} as Record<PillarType, TenGodType>,\n    data.secondaryElement as ElementType | undefined,\n    data.twelveFortunes,\n    data.hiddenStems,\n    data.twelveSpiritKillers,\n    data.dayMaster as CelestialStem | undefined\n  );\n}\n\`\`\`\n\n`;
  
  return guide;
}

/**
 * saju-data-transformer.serviceの修正手順を生成
 */
function generateSajuDataTransformerFix() {
  let guide = `# saju-data-transformer.service.ts 修正ガイド\n\n`;
  
  guide += `## 主なエラー内容と修正方針\n\n`;
  guide += `1. **型パラメータのミスマッチ**\n`;
  guide += `   - エラー例: \`Argument of type 'string' is not assignable to parameter of type 'ElementType'.\`\n`;
  guide += `   - 原因: 文字列をElementType等の特定の型パラメータに渡そうとしています\n`;
  guide += `   - 修正方法: 型アサーションを追加する\n\n`;
  
  guide += `   \`\`\`typescript\n   // 修正前\n   mainElement: userMainElement,\n   \n   // 修正後\n   mainElement: userMainElement as ElementType,\n   \`\`\`\n\n`;
  
  guide += `2. **SajuDataインターフェースプロパティの不整合**\n`;
  guide += `   - エラー例: \`Object literal may only specify known properties, and 'mainElement' does not exist in type 'SajuData'.\`\n`;
  guide += `   - 原因: SajuDataインターフェースに定義されていないプロパティを設定しようとしています\n`;
  guide += `   - 修正方法: 実装とインターフェース定義を一致させる\n\n`;
  
  guide += `   \`\`\`typescript\n   // interfaces/saju/fortune.ts内のSajuDataインターフェースを更新\n   export interface SajuData {\n     // 既存のプロパティ\n     dayMaster: string;\n     dayElement: ElementType;\n     tenGod: TenGodType;\n     branchTenGod: TenGodType;\n     compatibility: number;\n     \n     // 追加するプロパティ\n     mainElement: ElementType;  // <-- 追加\n     yinYang: YinYangType;      // <-- 追加\n     rating?: string;           // <-- 追加\n     // その他必要なプロパティ\n   }\n   \`\`\`\n\n`;
  
  guide += `3. **型アサーションの追加**\n`;
  guide += `   - 文字列を特定の型として扱う場合\n\n`;
  
  guide += `   \`\`\`typescript\n   // 修正前\n   tenGod = this.calculateTenGodRelation(userDayMaster, dayStem);\n   \n   // 修正後\n   tenGod = this.calculateTenGodRelation(userDayMaster as CelestialStem, dayStem as CelestialStem);\n   \`\`\`\n\n`;
  
  guide += `## 型アサーションを使用する際の注意点\n\n`;
  guide += `型アサーションは、TypeScriptのコンパイラに「このデータは確実にこの型である」と伝えるものです。実行時にチェックされないため、間違った型アサーションを行うとランタイムエラーが発生する可能性があります。\n\n`;
  guide += `可能であれば、型アサーションの前に値の検証を行うことをお勧めします：\n\n`;
  
  guide += `\`\`\`typescript\n// 安全な型アサーションの例\nconst validElements = ['木', '火', '土', '金', '水'];\nif (validElements.includes(element)) {\n  // この時点でelementはElementTypeの候補値のいずれかであることが確認できている\n  const typedElement = element as ElementType;\n  // typedElementを使用する処理\n}\n\`\`\`\n\n`;
  
  return guide;
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log(chalk.bold('TypeScriptエラー修正支援ツール\n'));
    
    let output = '';
    
    if (targetPath) {
      // 特定のパスを指定された場合
      output = await runTypeCheck(targetPath);
    } else {
      // デフォルトはbackendとfrontendをスキャン
      try {
        const backendOutput = await runTypeCheck('backend');
        output += backendOutput;
      } catch (err) {
        console.error(chalk.red('backendの型チェックに失敗しました:', err));
      }
      
      try {
        const frontendOutput = await runTypeCheck('frontend');
        output += frontendOutput;
      } catch (err) {
        console.error(chalk.red('frontendの型チェックに失敗しました:', err));
      }
    }
    
    if (!output) {
      console.log(chalk.green('\n✨ すべての型チェックが正常に完了しました！エラーはありません。'));
      return;
    }
    
    // エラーの分析
    const errors = parseErrors(output);
    const errorGroups = groupErrorsBySuggestion(errors);
    const errorsByFile = groupErrorsByFile(errors);
    
    // 一般的なガイド生成
    const guide = generateFixGuide(errorGroups);
    console.log('\n' + guide);
    
    // レポートディレクトリの作成
    const reportsDir = path.join(process.cwd(), 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    
    // 一般ガイドの保存
    const reportPath = path.join(reportsDir, 'typescript-errors.md');
    fs.writeFileSync(reportPath, guide.replace(/\x1b\[\d+m/g, ''));
    console.log(chalk.blue(`\nレポートを保存しました: ${reportPath}`));
    
    // 特定ファイルに特化したガイドの作成
    // システムメッセージビルダーの修正ガイド
    const systemMessageBuilderGuide = generateSystemMessageBuilderFix();
    const systemMessageBuilderPath = path.join(reportsDir, 'system-message-builder-fix.md');
    fs.writeFileSync(systemMessageBuilderPath, systemMessageBuilderGuide);
    console.log(chalk.blue(`システムメッセージビルダー修正ガイドを保存しました: ${systemMessageBuilderPath}`));
    
    // Sajuデータ変換サービスの修正ガイド
    const sajuDataTransformerGuide = generateSajuDataTransformerFix();
    const sajuDataTransformerPath = path.join(reportsDir, 'saju-data-transformer-fix.md');
    fs.writeFileSync(sajuDataTransformerPath, sajuDataTransformerGuide);
    console.log(chalk.blue(`Sajuデータ変換サービス修正ガイドを保存しました: ${sajuDataTransformerPath}`));
    
    // 重要なファイル固有のガイドを生成
    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      if (fileErrors.length > 10) { // 多くのエラーがあるファイルに注目
        const fileName = path.basename(filePath);
        const fileGuide = generateFileSpecificGuide(filePath, fileErrors);
        const fileGuidePath = path.join(reportsDir, `${fileName.replace(/\.[^/.]+$/, '')}-fix.md`);
        fs.writeFileSync(fileGuidePath, fileGuide);
        console.log(chalk.blue(`${fileName} 修正ガイドを保存しました: ${fileGuidePath}`));
      }
    }
    
    console.log(chalk.green('\n修正ガイドの生成が完了しました。reports ディレクトリ内のファイルを参照してください。'));
    
  } catch (error) {
    console.error(chalk.red('エラー:', error));
    process.exit(1);
  }
}

main();