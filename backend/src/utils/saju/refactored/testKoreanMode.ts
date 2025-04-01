/**
 * Simple test for Korean four pillars calculation
 */
import { calculateKoreanYearPillar } from './koreanYearPillarCalculator';
import { getDayPillar } from './dayPillarCalculator';
import { calculateKoreanMonthPillar } from './koreanMonthPillarCalculator';
import { calculateKoreanHourPillar } from './hourPillarCalculator';
import { getLocationCoordinates, getLunarDate } from './lunarDateCalculator';

// Test with specific dates
const testDates = [
  {
    description: "양 2022/04/06 23:00 여자 서울특별시",
    date: new Date(2022, 3, 6, 23, 0, 0),
    hour: 23,
    gender: 'F' as 'F',
    location: 'ソウル'
  },
  {
    description: "양 2024/02/04 12:00 여자 도쿄 도",
    date: new Date(2024, 1, 4, 12, 0, 0),
    hour: 12,
    gender: 'F' as 'F',
    location: '東京'
  },
  {
    description: "양 2023/02/03 12:00 여자 도쿄 도",
    date: new Date(2023, 1, 3, 12, 0, 0),
    hour: 12,
    gender: 'F' as 'F',
    location: '東京'
  }
];

// Run tests
function runTests() {
  console.log('=== Simple Korean Four Pillars Calculation Test ===\n');
  
  for (const test of testDates) {
    console.log(`【${test.description}】`);
    console.log(`Date: ${test.date.toISOString()}`);
    
    try {
      // 1. Year Pillar
      const yearPillar = calculateKoreanYearPillar(test.date.getFullYear());
      console.log(`Year Pillar: ${yearPillar.fullStemBranch}`);
      
      // 2. Month Pillar
      try {
        const monthPillar = calculateKoreanMonthPillar(test.date, yearPillar.stem);
        console.log(`Month Pillar: ${monthPillar.fullStemBranch} (via ${monthPillar.method})`);
      } catch (error) {
        console.error('Month pillar calculation error:', error);
      }
      
      // 3. Day Pillar
      const dayPillar = getDayPillar(test.date);
      console.log(`Day Pillar: ${dayPillar.fullStemBranch}`);
      
      // 4. Hour Pillar
      const hourPillar = calculateKoreanHourPillar(test.hour, dayPillar.stem);
      console.log(`Hour Pillar: ${hourPillar.fullStemBranch}`);
      
      // 5. Lunar Date
      const lunarDate = getLunarDate(test.date);
      if (lunarDate) {
        console.log(`Lunar Date: ${lunarDate.lunarYear}/${lunarDate.lunarMonth}/${lunarDate.lunarDay}${lunarDate.isLeapMonth ? ' (leap)' : ''}`);
      } else {
        console.log('Lunar Date: Not available');
      }
    } catch (error) {
      console.error(`Error processing ${test.description}:`, error);
    }
    
    console.log('\n---\n');
  }
}

// Run the tests
runTests();