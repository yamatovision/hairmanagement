/**
 * 十二神殺アルゴリズムの相互検証テスト
 * 
 * このテストは、十二神殺の各検出関数の結果と最終的な計算結果を
 * クロスチェックし、アルゴリズムの最適化に必要な情報を提供します。
 */

const { 
  calculateTwelveSpirits,
  isBackwardsSecuritySpirit,
  isSixHarmSpirit,
  isReverseHorseSpirit,
  isLongLifeSpirit,
  isFireOpenerSpirit,
  isHeavenKillingSpirit,
  isMoneySpirit,
  isHourSpirit,
  isDaySpirit,
  isMonthSpirit,
  isYearSpirit,
  isRobberySpirit
} = require('./twelveFortuneSpiritCalculator');

/**
 * テストケースデータベース
 * サンプルデータとその正しい解釈に基づいた期待値を含みます
 */
const TEST_CASES = [
  {
    description: "2023年5月5日0時 (反安殺テスト)",
    input: {
      yearStem: "癸", 
      monthStem: "丙", 
      dayStem: "癸", 
      hourStem: "壬",
      yearBranch: "卯", 
      monthBranch: "辰", 
      dayBranch: "亥", 
      hourBranch: "子"
    },
    expected: {
      year: '財殺',
      month: '反安殺',
      day: '月殺',
      hour: '時殺'
    }
  },
  {
    description: "1986年5月26日5時 (特殊データセット)",
    input: {
      yearStem: "丙", 
      monthStem: "癸", 
      dayStem: "庚", 
      hourStem: "己",
      yearBranch: "寅", 
      monthBranch: "巳", 
      dayBranch: "午", 
      hourBranch: "卯"
    },
    expected: {
      year: '劫殺',
      month: '望神殺',
      day: '長成殺',
      hour: '年殺'
    }
  },
  {
    description: "2023年10月15日12時 (六害殺テスト)",
    input: {
      yearStem: "癸", 
      monthStem: "壬", 
      dayStem: "丙", 
      hourStem: "甲",
      yearBranch: "卯", 
      monthBranch: "戌", 
      dayBranch: "午", 
      hourBranch: "午"
    },
    expected: {
      year: '年殺',
      month: '天殺',
      day: '六害殺',
      hour: '六害殺'
    }
  },
  {
    description: "1970年1月1日0時 (長生殺テスト)",
    input: {
      yearStem: "己", 
      monthStem: "丙", 
      dayStem: "辛", 
      hourStem: "戊",
      yearBranch: "酉", 
      monthBranch: "子", 
      dayBranch: "巳", 
      hourBranch: "子"
    },
    expected: {
      year: '長生殺',
      month: '月殺',
      day: '日殺',
      hour: '長生殺'
    }
  },
  {
    description: "2023年2月3日0時 (逆馬殺テスト)",
    input: {
      yearStem: "壬", 
      monthStem: "癸", 
      dayStem: "壬", 
      hourStem: "庚",
      yearBranch: "寅", 
      monthBranch: "丑", 
      dayBranch: "辰", 
      hourBranch: "子"
    },
    expected: {
      year: '逆馬殺',
      month: '月殺',
      day: '天殺',
      hour: '時殺'
    }
  }
];

/**
 * 各柱に対する各神殺の検出結果を収集する
 * @param {Object} testData テストデータ
 * @returns {Object} 集計結果
 */
function collectDetectionResults(testData) {
  const {
    yearStem, monthStem, dayStem, hourStem,
    yearBranch, monthBranch, dayBranch, hourBranch
  } = testData.input;

  // 検出結果の集計オブジェクト
  const results = {
    year: {},
    month: {},
    day: {},
    hour: {}
  };

  // 反安殺
  const backwardSecurityResults = isBackwardsSecuritySpirit(
    yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch
  );
  
  if (backwardSecurityResults.year) results.year['反安殺'] = true;
  if (backwardSecurityResults.month) results.month['反安殺'] = true;
  if (backwardSecurityResults.day) results.day['反安殺'] = true;
  if (backwardSecurityResults.hour) results.hour['反安殺'] = true;

  // 六害殺
  const sixHarmResults = isSixHarmSpirit(
    yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch
  );
  
  if (sixHarmResults.year) results.year['六害殺'] = true;
  if (sixHarmResults.month) results.month['六害殺'] = true;
  if (sixHarmResults.day) results.day['六害殺'] = true;
  if (sixHarmResults.hour) results.hour['六害殺'] = true;

  // 逆馬殺
  const reverseHorseResults = isReverseHorseSpirit(
    yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch
  );
  
  if (reverseHorseResults.year) results.year['逆馬殺'] = true;
  if (reverseHorseResults.month) results.month['逆馬殺'] = true;
  if (reverseHorseResults.day) results.day['逆馬殺'] = true;
  if (reverseHorseResults.hour) results.hour['逆馬殺'] = true;

  // 長生殺
  const longLifeResults = isLongLifeSpirit(
    yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch
  );
  
  if (longLifeResults.year) results.year['長生殺'] = true;
  if (longLifeResults.month) results.month['長生殺'] = true;
  if (longLifeResults.day) results.day['長生殺'] = true;
  if (longLifeResults.hour) results.hour['長生殺'] = true;

  // 火開殺
  const fireOpenerResults = isFireOpenerSpirit(
    yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch
  );
  
  if (fireOpenerResults.year) results.year['火開殺'] = true;
  if (fireOpenerResults.month) results.month['火開殺'] = true;
  if (fireOpenerResults.day) results.day['火開殺'] = true;
  if (fireOpenerResults.hour) results.hour['火開殺'] = true;

  // 天殺
  const heavenKillingResults = isHeavenKillingSpirit(
    yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch
  );
  
  if (heavenKillingResults.year) results.year['天殺'] = true;
  if (heavenKillingResults.month) results.month['天殺'] = true;
  if (heavenKillingResults.day) results.day['天殺'] = true;
  if (heavenKillingResults.hour) results.hour['天殺'] = true;

  // 財殺 (単一の真偽値を返す)
  const moneySpiritResult = isMoneySpirit(
    dayStem, yearBranch, monthBranch, dayBranch, hourBranch, hourStem
  );
  
  if (moneySpiritResult) {
    // 財殺は主に年柱に表示されることが多い
    results.year['財殺'] = true;
  }

  // 時殺 (単一の真偽値を返す)
  const hourSpiritResult = isHourSpirit(
    dayStem, yearBranch, monthBranch, dayBranch, hourBranch, hourStem
  );
  
  if (hourSpiritResult) {
    results.hour['時殺'] = true;
  }

  // 日殺 (単一の真偽値を返す)
  const daySpiritResult = isDaySpirit(
    yearBranch, monthBranch, dayBranch, hourBranch
  );
  
  if (daySpiritResult) {
    results.day['日殺'] = true;
  }

  // 月殺 (単一の真偽値を返す)
  const monthSpiritResult = isMonthSpirit(
    yearBranch, monthBranch, dayBranch, hourBranch
  );
  
  if (monthSpiritResult) {
    results.month['月殺'] = true;
  }

  // 年殺 (単一の真偽値を返す)
  const yearSpiritResult = isYearSpirit(
    yearBranch, monthBranch, dayBranch, hourBranch
  );
  
  if (yearSpiritResult) {
    results.year['年殺'] = true;
  }

  // 劫殺 (単一の真偽値を返す)
  const robberySpiritResult = isRobberySpirit(
    yearBranch, monthBranch, dayBranch, hourBranch, yearStem, monthStem, dayStem, hourStem
  );
  
  if (robberySpiritResult) {
    // サンプルデータによると、劫殺は年柱か日柱に表示されることが多い
    if (yearBranch === '寅' || yearBranch === '申') {
      results.year['劫殺'] = true;
    } else if (dayBranch === '寅' || dayBranch === '申') {
      results.day['劫殺'] = true;
    } else {
      results.year['劫殺'] = true; // 不明な場合はデフォルトとして年柱に設定
    }
  }

  return results;
}

/**
 * 検出結果と優先度に基づいて最適な神殺を決定する
 * 優先度は神殺の重要性と影響力に基づく
 * @param {Object} detectionResults 検出結果オブジェクト
 * @returns {Object} 最終的な神殺判定
 */
function determineOptimalSpirits(detectionResults) {
  // 神殺の優先度マップ（数字が大きいほど優先度が高い）
  const PRIORITY = {
    '長生殺': 100,  // 最高優先度
    '六害殺': 90,
    '天殺': 80,
    '地殺': 75,
    '年殺': 70,
    '火開殺': 65,
    '逆馬殺': 60,
    '反安殺': 55,
    '財殺': 50,
    '月殺': 45,
    '日殺': 40,
    '劫殺': 35,
    '時殺': 30,
    '望神殺': 25   // 最低優先度
  };

  // 結果オブジェクト
  const results = {
    year: '',
    month: '',
    day: '',
    hour: ''
  };

  // 各柱の最適な神殺を判定
  Object.keys(results).forEach(pillar => {
    let highestPriority = -1;
    let selectedSpirit = '';

    // この柱で検出されたすべての神殺をチェック
    Object.keys(detectionResults[pillar]).forEach(spirit => {
      if (PRIORITY[spirit] > highestPriority) {
        highestPriority = PRIORITY[spirit];
        selectedSpirit = spirit;
      }
    });

    // デフォルト値を設定（検出されたものがない場合）
    if (!selectedSpirit) {
      switch (pillar) {
        case 'year':
          selectedSpirit = '望神殺';
          break;
        case 'month':
          selectedSpirit = '天殺';
          break;
        case 'day':
          selectedSpirit = '地殺';
          break;
        case 'hour':
          selectedSpirit = '年殺';
          break;
      }
    }

    results[pillar] = selectedSpirit;
  });

  return results;
}

/**
 * テストケースに対してアルゴリズムの精度をチェックする
 */
function evaluateAlgorithmAccuracy() {
  console.log("=== 十二神殺アルゴリズム検証テスト ===\n");
  
  let totalPillars = 0;
  let correctPillars = 0;
  let testCasesPassed = 0;
  let improvementSuggestions = [];
  
  for (const testCase of TEST_CASES) {
    console.log(`\n--- テストケース: ${testCase.description} ---`);
    
    const {
      yearStem, monthStem, dayStem, hourStem,
      yearBranch, monthBranch, dayBranch, hourBranch
    } = testCase.input;
    
    // 1. 現在の実装による計算結果
    const currentImplementationResult = calculateTwelveSpirits(
      yearBranch, monthBranch, dayBranch, hourBranch, 
      null, null, // date, hour (null for direct calculation)
      dayStem, yearStem, monthStem, hourStem
    );
    
    // 2. すべての検出器の結果を収集
    const detectionResults = collectDetectionResults(testCase);
    
    // 3. データ駆動型の最適な結果を決定
    const optimizedResult = determineOptimalSpirits(detectionResults);
    
    // 結果を表示
    console.log("期待される結果:", JSON.stringify(testCase.expected));
    console.log("現在の実装結果:", JSON.stringify(currentImplementationResult));
    console.log("最適化された結果:", JSON.stringify(optimizedResult));
    
    // 検出された神殺の詳細を表示
    console.log("\n検出された神殺:");
    for (const pillar of ['year', 'month', 'day', 'hour']) {
      console.log(`  ${pillar}柱:`, Object.keys(detectionResults[pillar]).join(', ') || 'なし');
    }
    
    // 精度の評価
    const pillars = ['year', 'month', 'day', 'hour'];
    let currentImplCorrect = 0;
    let optimizedCorrect = 0;
    
    // 改善すべき箇所を記録
    const improvements = [];
    
    for (const pillar of pillars) {
      totalPillars++;
      
      // 現在の実装の精度
      if (testCase.expected[pillar] === currentImplementationResult[pillar]) {
        currentImplCorrect++;
      }
      
      // 最適化されたアルゴリズムの精度
      if (testCase.expected[pillar] === optimizedResult[pillar]) {
        optimizedCorrect++;
      }
      
      // 改善点の検出
      if (testCase.expected[pillar] !== currentImplementationResult[pillar]) {
        if (testCase.expected[pillar] === optimizedResult[pillar]) {
          // 最適化アルゴリズムは正しいが、現在の実装は誤り
          improvements.push(`${pillar}柱: 期待値="${testCase.expected[pillar]}", 現在値="${currentImplementationResult[pillar]}", 修正が必要`);
        } else {
          // 両方の実装が誤り
          improvements.push(`${pillar}柱: 期待値="${testCase.expected[pillar]}", 現在値="${currentImplementationResult[pillar]}", 最適値="${optimizedResult[pillar]}", 検出ロジックの改善が必要`);
        }
      }
    }
    
    // このテストケースの精度
    const currentAccuracy = (currentImplCorrect / 4) * 100;
    const optimizedAccuracy = (optimizedCorrect / 4) * 100;
    
    console.log(`\n現在の実装の精度: ${currentAccuracy}% (${currentImplCorrect}/4)`);
    console.log(`最適化後の精度: ${optimizedAccuracy}% (${optimizedCorrect}/4)`);
    
    if (currentImplCorrect === 4) {
      testCasesPassed++;
      console.log("✓ テストケース通過");
    } else {
      console.log("✗ テストケース失敗");
      console.log("\n改善すべき点:");
      improvements.forEach((imp, i) => console.log(`  ${i+1}. ${imp}`));
      improvementSuggestions.push({
        testCase: testCase.description,
        improvements
      });
    }
    
    correctPillars += currentImplCorrect;
  }
  
  // 全体の精度
  const overallAccuracy = (correctPillars / totalPillars) * 100;
  const testCaseAccuracy = (testCasesPassed / TEST_CASES.length) * 100;
  
  console.log("\n=== 精度サマリー ===");
  console.log(`現在の実装の全体精度: ${overallAccuracy.toFixed(2)}% (${correctPillars}/${totalPillars} 柱)`);
  console.log(`テストケース通過率: ${testCaseAccuracy.toFixed(2)}% (${testCasesPassed}/${TEST_CASES.length} ケース)`);
  
  // 改善提案のサマリー
  if (improvementSuggestions.length > 0) {
    console.log("\n=== 改善提案サマリー ===");
    improvementSuggestions.forEach((suggestion, i) => {
      console.log(`\n${i+1}. テストケース "${suggestion.testCase}" の改善点:`);
      suggestion.improvements.forEach((imp, j) => console.log(`   ${j+1}. ${imp}`));
    });
    
    // アルゴリズム改善の提案
    console.log("\n=== アルゴリズム改善戦略 ===");
    console.log("1. 優先度システムの実装: 複数の神殺が検出された場合、優先度に基づいて選択");
    console.log("2. 検出関数の精緻化: サンプルデータとの一致度を高めるために検出条件を調整");
    console.log("3. 特殊ケースの処理: 特定の日付に対する特殊ルールの追加");
  } else {
    console.log("\n✓ すべてのテストケースが通過しました！");
  }
}

// テストの実行
evaluateAlgorithmAccuracy();