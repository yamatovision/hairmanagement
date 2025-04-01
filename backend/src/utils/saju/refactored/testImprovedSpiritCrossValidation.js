/**
 * 改良版十二神殺アルゴリズムの相互検証テスト
 * 
 * このテストは、改良版の十二神殺計算アルゴリズムを評価し、
 * 元のアルゴリズムとの精度比較を行います。
 */

// TypeScriptモジュールをrequireするための設定
require('ts-node').register();

// アルゴリズム実装のインポート
const { 
  calculateTwelveSpirits: improvedCalculator,
  isSixHarmSpirit,
  isWealthSpirit,
  isHopeSpirit,
  isRobberySpirit,
  isHourSpirit,
  isReversedHorseSpirit
} = require('./twelveSpiritKillerCalculator.ts');

const {
  calculateTwelveSpirits: originalCalculator
} = require('./twelveFortuneSpiritCalculator.js');

/**
 * テストケースデータベース
 * サンプルデータとその正しい解釈に基づいた期待値を含みます
 */
const TEST_CASES = [
  {
    description: "1986-02-04 10:00 (劫殺・財殺テスト)",
    input: {
      yearStem: "丙", 
      monthStem: "甲", 
      dayStem: "庚", 
      hourStem: "壬",
      yearBranch: "寅", 
      monthBranch: "寅", 
      dayBranch: "午", 
      hourBranch: "子"
    },
    expected: {
      year: '劫殺',
      month: '',
      day: '',
      hour: '財殺'
    }
  },
  {
    description: "1990-05-15 14:00 (望神殺・六害殺テスト)",
    input: {
      yearStem: "庚", 
      monthStem: "辛", 
      dayStem: "丙", 
      hourStem: "己",
      yearBranch: "午", 
      monthBranch: "巳", 
      dayBranch: "子", 
      hourBranch: "未"
    },
    expected: {
      year: '',
      month: '望神殺',
      day: '六害殺',
      hour: ''
    }
  },
  {
    description: "2005-07-07 20:00 (財殺・六害殺テスト)",
    input: {
      yearStem: "乙", 
      monthStem: "丁", 
      dayStem: "癸", 
      hourStem: "辛",
      yearBranch: "酉", 
      monthBranch: "未", 
      dayBranch: "未", 
      hourBranch: "酉"
    },
    expected: {
      year: '財殺',
      month: '',
      day: '',
      hour: '六害殺'
    }
  },
  {
    description: "1984-02-04 06:00 (劫殺・時殺テスト)",
    input: {
      yearStem: "甲", 
      monthStem: "丙", 
      dayStem: "乙", 
      hourStem: "丁",
      yearBranch: "子", 
      monthBranch: "寅", 
      dayBranch: "卯", 
      hourBranch: "巳"
    },
    expected: {
      year: '',
      month: '劫殺',
      day: '',
      hour: '時殺'
    }
  },
  {
    description: "2023-10-15 17:00 (六害殺・劫殺・逆馬殺テスト)",
    input: {
      yearStem: "癸", 
      monthStem: "辛", 
      dayStem: "戊", 
      hourStem: "丙",
      yearBranch: "卯", 
      monthBranch: "戌", 
      dayBranch: "申", 
      hourBranch: "申"
    },
    expected: {
      year: '',
      month: '六害殺',
      day: '劫殺',
      hour: '逆馬殺'
    }
  }
];

/**
 * 検出アルゴリズムの評価
 * @param {Function} algorithm 評価対象のアルゴリズム
 * @param {string} name アルゴリズムの名前
 */
function evaluateAlgorithm(algorithm, name) {
  console.log(`\n=== ${name}の評価 ===\n`);
  
  let totalPillars = 0;
  let correctPillars = 0;
  const resultsByPillar = { year: 0, month: 0, day: 0, hour: 0 };
  const totalByPillar = { year: 0, month: 0, day: 0, hour: 0 };
  
  for (const testCase of TEST_CASES) {
    console.log(`▶ テストケース: ${testCase.description}`);
    
    const {
      yearStem, monthStem, dayStem, hourStem,
      yearBranch, monthBranch, dayBranch, hourBranch
    } = testCase.input;
    
    // アルゴリズムに応じた関数呼び出し
    let result;
    if (name === '改良版アルゴリズム') {
      result = algorithm(
        yearStem, monthStem, dayStem, hourStem,
        yearBranch, monthBranch, dayBranch, hourBranch
      );
    } else {
      // 元のアルゴリズム
      result = algorithm(
        yearBranch, monthBranch, dayBranch, hourBranch, 
        null, null, // date, hour (null for direct calculation)
        dayStem, yearStem, monthStem, hourStem
      );
    }
    
    console.log("期待される結果:", JSON.stringify(testCase.expected));
    console.log("算出結果:", JSON.stringify(result));
    
    // 各柱の精度を評価
    const pillars = ['year', 'month', 'day', 'hour'];
    let testCorrect = 0;
    
    for (const pillar of pillars) {
      totalPillars++;
      totalByPillar[pillar]++;
      
      if (testCase.expected[pillar] === result[pillar]) {
        correctPillars++;
        resultsByPillar[pillar]++;
        testCorrect++;
      }
    }
    
    // このテストケースの精度
    const accuracy = (testCorrect / 4) * 100;
    console.log(`一致率: ${accuracy}% (${testCorrect}/4)\n`);
  }
  
  // 全体の精度
  const overallAccuracy = (correctPillars / totalPillars) * 100;
  
  console.log("=== 精度サマリー ===");
  console.log(`全体精度: ${overallAccuracy.toFixed(2)}% (${correctPillars}/${totalPillars} 柱)`);
  
  // 柱ごとの精度
  console.log("\n柱ごとの精度:");
  for (const pillar of ['year', 'month', 'day', 'hour']) {
    const accuracy = (resultsByPillar[pillar] / totalByPillar[pillar]) * 100;
    console.log(`${pillar}柱: ${accuracy.toFixed(2)}% (${resultsByPillar[pillar]}/${totalByPillar[pillar]})`);
  }
  
  return {
    overall: overallAccuracy,
    byPillar: {
      year: (resultsByPillar.year / totalByPillar.year) * 100,
      month: (resultsByPillar.month / totalByPillar.month) * 100,
      day: (resultsByPillar.day / totalByPillar.day) * 100,
      hour: (resultsByPillar.hour / totalByPillar.hour) * 100
    }
  };
}

/**
 * アルゴリズムの比較評価
 */
function compareAlgorithms() {
  console.log("=== 十二神殺アルゴリズム比較評価 ===");
  
  // 元のアルゴリズムを評価
  const originalResults = evaluateAlgorithm(originalCalculator, '元のアルゴリズム');
  
  // 改良版アルゴリズムを評価
  const improvedResults = evaluateAlgorithm(improvedCalculator, '改良版アルゴリズム');
  
  // 結果の比較
  console.log("\n=== アルゴリズム比較 ===");
  console.log(`全体精度: 元=${originalResults.overall.toFixed(2)}%, 改良版=${improvedResults.overall.toFixed(2)}%`);
  
  console.log("\n柱ごとの精度比較:");
  for (const pillar of ['year', 'month', 'day', 'hour']) {
    const originalAccuracy = originalResults.byPillar[pillar];
    const improvedAccuracy = improvedResults.byPillar[pillar];
    const improvement = improvedAccuracy - originalAccuracy;
    
    // 向上/低下のマーク
    const marker = improvement > 0 ? '↑' : (improvement < 0 ? '↓' : '→');
    
    console.log(`${pillar}柱: 元=${originalAccuracy.toFixed(2)}%, 改良版=${improvedAccuracy.toFixed(2)}% (${marker}${Math.abs(improvement).toFixed(2)}%)`);
  }
  
  // 総合評価
  const overallImprovement = improvedResults.overall - originalResults.overall;
  console.log(`\n総合精度向上: ${overallImprovement > 0 ? '+' : ''}${overallImprovement.toFixed(2)}%`);
  
  if (overallImprovement > 0) {
    console.log('✅ 改良版アルゴリズムは元のアルゴリズムより高精度です');
  } else if (overallImprovement < 0) {
    console.log('❌ 改良版アルゴリズムは元のアルゴリズムより精度が低下しています');
  } else {
    console.log('➖ 改良版アルゴリズムと元のアルゴリズムは同等の精度です');
  }
}

/**
 * 改良版アルゴリズムの検出関数の評価
 */
function evaluateDetectionFunctions() {
  console.log("\n=== 改良版検出関数の評価 ===");
  
  // 各テストケースでの各検出関数の成功率
  const detectionFunctions = [
    { name: 'isSixHarmSpirit', fn: isSixHarmSpirit, expectedMatches: ['1990-05-15 14:00 (day)', '2005-07-07 20:00 (hour)', '2023-10-15 17:00 (month)'] },
    { name: 'isWealthSpirit', fn: isWealthSpirit, expectedMatches: ['1986-02-04 10:00 (hour)', '2005-07-07 20:00 (year)'] },
    { name: 'isHopeSpirit', fn: isHopeSpirit, expectedMatches: ['1990-05-15 14:00 (month)'] },
    { name: 'isRobberySpirit', fn: isRobberySpirit, expectedMatches: ['1986-02-04 10:00 (year)', '1984-02-04 06:00 (month)', '2023-10-15 17:00 (day)'] },
    { name: 'isHourSpirit', fn: isHourSpirit, expectedMatches: ['1984-02-04 06:00 (hour)'] },
    { name: 'isReversedHorseSpirit', fn: isReversedHorseSpirit, expectedMatches: ['2023-10-15 17:00 (hour)'] }
  ];
  
  console.log("\n検出関数別の成功率:");
  
  for (const func of detectionFunctions) {
    console.log(`\n▶ ${func.name} の評価:`);
    let matches = 0;
    
    for (const testCase of TEST_CASES) {
      const {
        yearStem, monthStem, dayStem, hourStem,
        yearBranch, monthBranch, dayBranch, hourBranch
      } = testCase.input;
      
      // 検出関数によって引数が異なる場合があるため
      let result;
      try {
        if (func.name === 'isWealthSpirit' || func.name === 'isRobberySpirit' || 
            func.name === 'isHopeSpirit' || func.name === 'isHourSpirit' || 
            func.name === 'isReversedHorseSpirit') {
          result = func.fn(yearBranch, monthBranch, dayBranch, hourBranch, yearStem, monthStem, dayStem, hourStem);
        } else {
          result = func.fn(yearBranch, monthBranch, dayBranch, hourBranch);
        }
        
        // 検出関数が結果として真偽値ではなくオブジェクトを返す場合
        if (typeof result === 'object') {
          // 各柱の検出結果（例: {year: true, month: false, ...}）
          const hasMatch = Object.values(result).some(v => v === true);
          if (hasMatch) {
            matches++;
            console.log(`  ✓ ${testCase.description}`);
          } else {
            console.log(`  ✗ ${testCase.description}`);
          }
        } else {
          // 真偽値を返す関数の場合
          if (result) {
            matches++;
            console.log(`  ✓ ${testCase.description}`);
          } else {
            console.log(`  ✗ ${testCase.description}`);
          }
        }
      } catch (error) {
        console.log(`  ✗ ${testCase.description} - 関数でエラー: ${error.message}`);
      }
    }
    
    const accuracy = (matches / TEST_CASES.length) * 100;
    console.log(`  検出率: ${accuracy.toFixed(2)}% (${matches}/${TEST_CASES.length})`);
  }
}

// 主要評価の実行
compareAlgorithms();

// 詳細な検出関数評価
// evaluateDetectionFunctions();