/**
 * Import debug script
 */
const koreanCalc = require('./koreanMonthPillarCalculator');

console.log('Module contents:');
console.log(Object.keys(koreanCalc));

if (koreanCalc.MONTH_PILLAR_REFERENCE) {
  console.log('Reference table size:', Object.keys(koreanCalc.MONTH_PILLAR_REFERENCE).length);
  console.log('Sample entry:', Object.entries(koreanCalc.MONTH_PILLAR_REFERENCE)[0]);
} else {
  console.log('MONTH_PILLAR_REFERENCE is undefined or null');
}

// Test one calculation
if (koreanCalc.calculateKoreanMonthPillar) {
  const testDate = new Date(2023, 9, 15); // 2023-10-15
  const result = koreanCalc.calculateKoreanMonthPillar(testDate, '癸');
  console.log('Test calculation result:', result);
} else {
  console.log('calculateKoreanMonthPillar function is missing');
}