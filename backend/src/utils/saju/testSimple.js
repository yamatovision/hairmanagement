/**
 * 四柱推命の簡易テスト
 * コンパイル済みのJSファイルを使用したテスト
 */

// コンパイル済みのモジュールパスを指定
const sajuPath = '../../../dist/utils/saju';
let SajuCalculator;

// メインテスト関数
async function runTest() {
  console.log('===== 四柱推命簡易テスト開始 =====\n');
  
  try {
    // モジュールの動的インポート
    const sajuModule = await loadModules();
    if (!sajuModule) {
      console.log('モジュールのロードに失敗しました。開発環境で正しくコンパイルされていることを確認してください。');
      return;
    }
    
    SajuCalculator = sajuModule.SajuCalculator;
    
    // テストケース1: 1986年5月26日午前5時生まれ
    await testCase1();
    
    // テストケース2: 現在日時の四柱
    await testCase2();
    
  } catch (error) {
    console.error('テスト実行中のエラー:', error);
  }
  
  console.log('\n===== 四柱推命簡易テスト完了 =====');
}

// モジュール読み込み
async function loadModules() {
  try {
    // ts-nodeで直接実行する場合
    return require('./sajuCalculator');
  } catch (e) {
    try {
      // コンパイル済みのJSファイルがある場合
      return require(sajuPath + '/sajuCalculator');
    } catch (e2) {
      console.error('モジュール読み込みエラー:', e2);
      console.log('開発環境では、ts-nodeでTypeScriptファイルを直接実行してください。');
      console.log('例: npx ts-node -r tsconfig-paths/register src/utils/saju/testSajuCalculator.ts');
      return null;
    }
  }
}

// テストケース1: 特定の生年月日時の四柱
async function testCase1() {
  console.log('テストケース1: 1986年5月26日午前5時生まれ');
  console.log('-------------------------------------');
  
  const birthDate = new Date(1986, 4, 26); // 月は0からスタート
  const birthHour = 5;
  
  try {
    // 韓国式計算
    console.log('【韓国式計算】');
    const koreanResult = await SajuCalculator.calculate(birthDate, birthHour, undefined, true);
    logResult(koreanResult);
  } catch (error) {
    console.error('韓国式計算エラー:', error);
  }
}

// テストケース2: 今日の四柱
async function testCase2() {
  console.log('\nテストケース2: 今日の四柱');
  console.log('-------------------------------------');
  
  try {
    // 今日の四柱
    const today = await SajuCalculator.getTodayFourPillars();
    console.log('今日の四柱:', formatFourPillars(today));
  } catch (error) {
    console.error('テスト実行エラー:', error);
  }
}

// 計算結果の表示
function logResult(result) {
  if (!result) {
    console.log('計算結果がありません');
    return;
  }
  
  console.log('四柱:', formatFourPillars(result.fourPillars));
  
  if (result.elementProfile) {
    console.log('基本属性:', `${result.elementProfile.yinYang}${result.elementProfile.mainElement}`);
    console.log('副属性:', result.elementProfile.secondaryElement);
  }
  
  if (result.tenGods) {
    console.log('十神関係:');
    Object.entries(result.tenGods).forEach(([pillar, god]) => {
      console.log(`  ${pillar}: ${god}`);
    });
  }
}

// 四柱の文字列フォーマット
function formatFourPillars(fourPillars) {
  if (!fourPillars) return '不明';
  return `年柱[${fourPillars.yearPillar.fullStemBranch}] 月柱[${fourPillars.monthPillar.fullStemBranch}] 日柱[${fourPillars.dayPillar.fullStemBranch}] 時柱[${fourPillars.hourPillar.fullStemBranch}]`;
}

// テスト実行
runTest().catch(console.error);