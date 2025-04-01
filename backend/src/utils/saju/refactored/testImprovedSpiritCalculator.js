/**
 * 改良版十二神殺アルゴリズムのテストスクリプト
 * 
 * このスクリプトは、改良された十二神殺計算アルゴリズムと
 * オリジナルのアルゴリズムを比較し、精度向上を検証します。
 */

// TypeScriptモジュールをrequireするための設定
require('ts-node').register();

// 改良版とオリジナルのアルゴリズムをインポート
const { calculateTwelveSpirits: improvedCalculator, validateWithSamples } = require('./twelveSpiritKillerCalculator.ts');
const { calculateTwelveSpirits: originalCalculator } = require('./twelveFortuneSpiritCalculator.js');

// テストサンプルデータ
const testSamples = [
  {
    // サンプル1: 1986年2月4日 10:00
    id: "1986-02-04 10:00",
    stems: ['丙', '甲', '庚', '壬'],
    branches: ['寅', '寅', '午', '子'],
    expected: { year: '劫殺', month: '', day: '', hour: '財殺' }
  },
  {
    // サンプル2: 1990年5月15日 14:00
    id: "1990-05-15 14:00",
    stems: ['庚', '辛', '丙', '己'],
    branches: ['午', '巳', '子', '未'],
    expected: { year: '', month: '望神殺', day: '六害殺', hour: '' }
  },
  {
    // サンプル3: 2005年7月7日 20:00
    id: "2005-07-07 20:00",
    stems: ['乙', '丁', '癸', '辛'],
    branches: ['酉', '未', '未', '酉'],
    expected: { year: '財殺', month: '', day: '', hour: '六害殺' }
  },
  {
    // サンプル4: 1984年2月4日 06:00
    id: "1984-02-04 06:00",
    stems: ['甲', '丙', '乙', '丁'],
    branches: ['子', '寅', '卯', '巳'],
    expected: { year: '', month: '劫殺', day: '', hour: '時殺' }
  },
  {
    // サンプル5: 2023年10月15日 17:00
    id: "2023-10-15 17:00",
    stems: ['癸', '辛', '戊', '丙'],
    branches: ['卯', '戌', '申', '申'],
    expected: { year: '', month: '六害殺', day: '劫殺', hour: '逆馬殺' }
  }
];

/**
 * アルゴリズムの精度を比較する関数
 */
function compareAlgorithms() {
  console.log('=== 十二神殺アルゴリズム比較検証 ===');
  console.log('改良版vs元のアルゴリズムの精度比較\n');
  
  // 結果統計の初期化
  const stats = {
    original: { total: 0, correct: 0, byPillar: { year: 0, month: 0, day: 0, hour: 0 } },
    improved: { total: 0, correct: 0, byPillar: { year: 0, month: 0, day: 0, hour: 0 } }
  };
  
  // 各サンプルに対してテスト実行
  testSamples.forEach((sample, index) => {
    console.log(`▶ サンプル${index + 1}: ${sample.id}`);
    
    // 元のアルゴリズムでの計算
    const originalResult = originalCalculator(
      sample.branches[0], sample.branches[1], sample.branches[2], sample.branches[3],
      null, null, sample.stems[2], // dayStem
      sample.stems[0], sample.stems[1], sample.stems[3] // yearStem, monthStem, hourStem
    );
    
    // 改良版アルゴリズムでの計算
    const improvedResult = improvedCalculator(
      sample.stems[0], sample.stems[1], sample.stems[2], sample.stems[3],
      sample.branches[0], sample.branches[1], sample.branches[2], sample.branches[3]
    );
    
    console.log('期待結果:', sample.expected);
    console.log('元のアルゴリズム:', originalResult);
    console.log('改良版アルゴリズム:', improvedResult);
    
    // 一致状況の確認と統計計算
    ['year', 'month', 'day', 'hour'].forEach(pillar => {
      // 元のアルゴリズム
      const originalMatch = originalResult[pillar] === sample.expected[pillar];
      if (originalMatch) {
        stats.original.correct++;
        stats.original.byPillar[pillar]++;
      }
      stats.original.total++;
      
      // 改良版アルゴリズム
      const improvedMatch = improvedResult[pillar] === sample.expected[pillar];
      if (improvedMatch) {
        stats.improved.correct++;
        stats.improved.byPillar[pillar]++;
      }
      stats.improved.total++;
      
      // 結果表示
      console.log(`${pillar}: 期待=${sample.expected[pillar]}, 元=${originalResult[pillar]}(${originalMatch ? '✓' : '✗'}), 改良=${improvedResult[pillar]}(${improvedMatch ? '✓' : '✗'})`);
    });
    
    console.log('---\n');
  });
  
  // 総合結果表示
  console.log('=== 精度比較結果 ===');
  console.log(`元のアルゴリズム: ${stats.original.correct}/${stats.original.total} = ${(stats.original.correct / stats.original.total * 100).toFixed(1)}%`);
  console.log(`改良版アルゴリズム: ${stats.improved.correct}/${stats.improved.total} = ${(stats.improved.correct / stats.improved.total * 100).toFixed(1)}%`);
  
  // 柱ごとの精度比較
  console.log('\n柱ごとの精度比較:');
  ['year', 'month', 'day', 'hour'].forEach(pillar => {
    const originalAccuracy = (stats.original.byPillar[pillar] / testSamples.length * 100).toFixed(1);
    const improvedAccuracy = (stats.improved.byPillar[pillar] / testSamples.length * 100).toFixed(1);
    const diff = (improvedAccuracy - originalAccuracy).toFixed(1);
    const trend = diff > 0 ? '↑' : (diff < 0 ? '↓' : '→');
    
    console.log(`${pillar}: 元=${originalAccuracy}%, 改良=${improvedAccuracy}% (${trend}${Math.abs(diff)}%)`);
  });
  
  // 精度向上の総合評価
  const originalTotalAccuracy = (stats.original.correct / stats.original.total * 100).toFixed(1);
  const improvedTotalAccuracy = (stats.improved.correct / stats.improved.total * 100).toFixed(1);
  const totalDiff = (improvedTotalAccuracy - originalTotalAccuracy).toFixed(1);
  
  console.log(`\n総合精度向上: ${totalDiff > 0 ? '+' : ''}${totalDiff}%`);
  
  if (totalDiff > 0) {
    console.log('✅ 改良版アルゴリズムは元のアルゴリズムより高精度です');
  } else if (totalDiff < 0) {
    console.log('❌ 改良版アルゴリズムは元のアルゴリズムより精度が低下しています');
  } else {
    console.log('➖ 改良版アルゴリズムと元のアルゴリズムは同等の精度です');
  }
}

// 検証実行
compareAlgorithms();
console.log('\n');
validateWithSamples();