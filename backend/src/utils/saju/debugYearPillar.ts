/**
 * 年柱計算のデバッグ用スクリプト
 */

import { calculateYearPillar } from './fourPillars';
import { STEMS, BRANCHES } from './calendar';

function main() {
  console.log('===== 年柱計算のデバッグ =====\n');
  
  // 2019年の年柱を計算
  const year = 2019;
  
  // 1. 通常計算方式
  const standardYearPillar = calculateYearPillar(year);
  console.log('1. 通常計算方式:');
  console.log(`  年: ${year}`);
  console.log(`  年柱: ${standardYearPillar.fullStemBranch}`);
  console.log(`  天干: ${standardYearPillar.stem}（インデックス: ${STEMS.indexOf(standardYearPillar.stem)}）`);
  console.log(`  地支: ${standardYearPillar.branch}（インデックス: ${BRANCHES.indexOf(standardYearPillar.branch)}）`);
  
  // 2. 修正計算方式（丁亥にするために）
  console.log('\n2. 丁亥を得るための計算:');
  
  // 丁のインデックスは3、亥のインデックスは11
  const desiredStemIndex = 3; // 丁
  const desiredBranchIndex = 11; // 亥
  
  // 天干の計算式を逆算
  const stemOffset = (desiredStemIndex - (year % 10) + 10) % 10;
  console.log(`  天干オフセット: ${stemOffset}`);
  console.log(`  計算式: (year + ${stemOffset}) % 10 = ${desiredStemIndex}`);
  
  // 地支の計算式を逆算
  const branchOffset = (desiredBranchIndex - (year % 12) + 12) % 12;
  console.log(`  地支オフセット: ${branchOffset}`);
  console.log(`  計算式: (year + ${branchOffset}) % 12 = ${desiredBranchIndex}`);
  
  // 新しい計算式のテスト
  console.log('\n3. 新しい計算式のテスト:');
  const newStemIndex = (year + stemOffset) % 10;
  const newBranchIndex = (year + branchOffset) % 12;
  console.log(`  新天干インデックス: ${newStemIndex} => ${STEMS[newStemIndex]}`);
  console.log(`  新地支インデックス: ${newBranchIndex} => ${BRANCHES[newBranchIndex]}`);
  console.log(`  新年柱: ${STEMS[newStemIndex]}${BRANCHES[newBranchIndex]}`);
  
  // 計算式の一般化
  console.log('\n4. 一般化された計算式:');
  console.log(`  天干 = STEMS[(year + ${stemOffset}) % 10]`);
  console.log(`  地支 = BRANCHES[(year + ${branchOffset}) % 12]`);
  
  // 2018-2022の年柱をテスト
  console.log('\n5. 2018-2022の年柱テスト:');
  for (let testYear = 2018; testYear <= 2022; testYear++) {
    const stemIndex = (testYear + stemOffset) % 10;
    const branchIndex = (testYear + branchOffset) % 12;
    console.log(`  ${testYear}年: ${STEMS[stemIndex]}${BRANCHES[branchIndex]}`);
  }
}

main();