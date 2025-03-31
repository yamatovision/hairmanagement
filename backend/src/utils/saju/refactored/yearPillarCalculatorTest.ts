/**
 * 年柱計算モジュールのテスト
 * 
 * calender.mdからのデータと比較して検証します。
 */
import { 
  getYearPillar, 
  calculateStandardYearPillar, 
  calculateKoreanYearPillar,
  verifyYearPillar
} from './yearPillarCalculator';
import { Pillar } from './types';

/**
 * 簡易テスト関数
 */
function assertEqual(actual: any, expected: any, message: string) {
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${message}: ${isEqual ? '✅ 成功' : '❌ 失敗'}`);
  if (!isEqual) {
    console.log('  期待値:', expected);
    console.log('  実際値:', actual);
  }
  return isEqual;
}

/**
 * テスト実行
 */
async function runTests() {
  console.log('===== 年柱計算モジュール テスト開始 =====');

  // calender.mdからのサンプルデータ
  const testData = [
    { year: 1970, expected: "己酉" }, // 양 1970/01/01 00:00 남자 서울특별시
    { year: 1985, expected: "甲子" }, // 양 1985/01/01 00:00 남자 서울특별시
    { year: 1995, expected: "甲戌" }, // 양 1995/01/01 00:00 남자 서울특별시
    { year: 2005, expected: "甲申" }, // 양 2005/01/01 00:00 남자 서울특별시
    { year: 2015, expected: "甲午" }  // 양 2015/01/01 00:00 남자 서울특별시
  ];

  // 標準計算のテスト
  console.log('\n----- 標準計算のテスト -----');
  let successCount = 0;
  let failCount = 0;
  
  for (const test of testData) {
    const result = calculateStandardYearPillar(test.year);
    const success = assertEqual(result.fullStemBranch, test.expected, `${test.year}年の年柱`);
    if (success) successCount++; else failCount++;
  }
  
  console.log(`\n標準計算: ${successCount}成功, ${failCount}失敗`);
  
  // 韓国式計算のテスト
  console.log('\n----- 韓国式計算のテスト -----');
  successCount = 0;
  failCount = 0;
  
  for (const test of testData) {
    const result = calculateKoreanYearPillar(test.year);
    const success = assertEqual(result.fullStemBranch, test.expected, `${test.year}年の韓国式年柱`);
    if (success) successCount++; else failCount++;
  }
  
  console.log(`\n韓国式計算: ${successCount}成功, ${failCount}失敗`);

  // 統合関数のテスト
  console.log('\n----- getYearPillar関数のテスト -----');
  
  // 標準モード
  const standardResult = getYearPillar(1985);
  assertEqual(standardResult.fullStemBranch, "乙丑", "標準モード - 1985年");
  
  // 韓国式モード
  const koreanResult = getYearPillar(1985, { useKoreanMethod: true });
  assertEqual(koreanResult.fullStemBranch, "甲子", "韓国式モード - 1985年");

  // 蔵干のテスト
  console.log('\n----- 蔵干のテスト -----');
  const pillar1985 = calculateKoreanYearPillar(1985);
  assertEqual(pillar1985.hiddenStems, ["癸"], "1985年(甲子年)の蔵干");
  
  const pillar1995 = calculateKoreanYearPillar(1995);
  assertEqual(pillar1995.hiddenStems, ["戊", "辛", "丁"], "1995年(甲戌年)の蔵干");

  // 広範囲のテスト
  console.log('\n----- 広範囲テスト -----');
  const years = [1924, 1960, 1984, 2020, 2024, 2044];
  
  for (const year of years) {
    const result = calculateKoreanYearPillar(year);
    console.log(`${year}年の年柱: ${result.fullStemBranch} (蔵干: ${result.hiddenStems?.join(', ')})`);
  }

  // 内部検証関数のテスト
  console.log('\n----- 内部検証関数のテスト -----');
  const verificationResult = verifyYearPillar();
  console.log(`内部検証関数の結果: ${verificationResult ? '✅ 全て成功' : '❌ 一部失敗'}`);

  // 干支の60周期検証
  console.log('\n----- 干支の60周期検証 -----');
  // 甲子年は60年周期で現れるはず
  const stemBranch1924 = calculateKoreanYearPillar(1924).fullStemBranch;
  const stemBranch1984 = calculateKoreanYearPillar(1984).fullStemBranch;
  const stemBranch2044 = calculateKoreanYearPillar(2044).fullStemBranch;
  
  console.log(`1924年の年柱: ${stemBranch1924}`);
  console.log(`1984年の年柱: ${stemBranch1984}`);
  console.log(`2044年の年柱: ${stemBranch2044}`);
  
  if (stemBranch1924 === stemBranch1984 && stemBranch1984 === stemBranch2044) {
    console.log('✅ 60年周期の確認成功');
  } else {
    console.log('❌ 60年周期の確認失敗');
  }

  console.log('\n===== テスト完了 =====');
  
  return {
    standardSuccessRate: successCount / testData.length,
    koreanSuccessRate: successCount / testData.length
  };
}

// テスト実行
runTests()
  .then(result => {
    console.log('\n韓国式四柱推命の年柱計算アルゴリズム：');
    
    console.log(`
韓国式四柱推命の年柱計算アルゴリズム（一般化）：

1. 一般的な公式：
   - 天干インデックス = (year - 4) % 10
   - 地支インデックス = (year - 4) % 12

2. 検証ポイント：
   - 1924年、1984年、2044年はすべて甲子年
   - 60年周期を確認

3. 蔵干（地支に内包される天干）：
   - 子: 癸
   - 丑: 己、辛、癸
   - 寅: 甲、丙、戊
   - 卯: 乙
   - 辰: 戊、乙、癸
   - 巳: 丙、庚、戊
   - 午: 丁、己
   - 未: 己、乙、丁
   - 申: 庚、壬、戊
   - 酉: 辛
   - 戌: 戊、辛、丁
   - 亥: 壬、甲

使用例：
const yearPillar = getYearPillar(2024, { useKoreanMethod: true });
console.log(yearPillar.fullStemBranch); // 甲辰
console.log(yearPillar.hiddenStems); // ["戊", "乙", "癸"]
    `);
  })
  .catch(err => console.error('テスト実行エラー:', err));