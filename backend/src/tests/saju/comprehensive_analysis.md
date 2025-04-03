# SajuEngine 精度向上のための包括的分析

## 1. 現状分析

現在のSajuEngineの実装を38件のテストケースで検証した結果、全体の成功率は46.05%となりました。柱ごとの精度には大きな差があり、年柱は高精度ですが日柱と時柱の精度は非常に低い状況です。

### 1.1 柱ごとの成功率

| 柱 | 成功率 | 評価 |
|---|--------|------|
| 年柱 | 86.84% | 良好 |
| 月柱 | 57.89% | 改善必要 |
| 日柱 | 15.79% | 大幅な改善必要 |
| 時柱 | 23.68% | 大幅な改善必要 |

### 1.2 一致数の分布

- 完全一致（4柱）: 10.53%
- 3柱一致: 5.26%
- 2柱一致: 42.11%
- 1柱一致: 42.11%
- 完全不一致: 0.00%

## 2. 主要な問題パターン

### 2.1 年柱の不一致パターン

| 変換パターン | 件数 | 特徴 |
|------------|------|------|
| 壬寅 → 癸卯 | 3 | 立春日前後（2023年2月）での年柱変化 |
| 辛丑 → 壬寅 | 1 | 2022年2月初旬（立春日付近） |
| 甲辰 → 癸卯 | 1 | 2024年2月4日（立春日） |

**発見**: 立春日前後の年柱計算において一貫した問題があり、立春の時刻を正確に考慮できていない。

### 2.2 月柱の不一致パターン

| 変換パターン | 件数 | 特徴 |
|------------|------|------|
| 庚申 → 己未 | 5 | 2023年7月の複数テスト |
| 壬子 → 甲子 | 3 | 1月の新年テスト（1924年、1984年、2044年） |
| 己未 → 甲午 | 2 | 1986年7月のテスト |

**発見**: 特定の月（特に7月と1月）に系統的な不一致があり、節気境界の処理に問題がある可能性が高い。

### 2.3 日柱の不一致パターン（最も深刻）

日柱の不一致パターンは非常に多岐にわたり、一貫したパターンが見つかりにくいが、以下の点に注目する必要があります：

1. ほとんどの場合に日柱が一致しない（成功率15.79%）
2. 特に月をまたぐ境界日や節気変化の前後で顕著な不一致

**発見**: 日柱計算のアルゴリズム全体を見直す必要がある。韓国式四柱推命の特殊ルールが考慮されていない可能性が高い。

### 2.4 時柱の不一致パターン

| 変換パターン | 件数 | 特徴 |
|------------|------|------|
| 壬子 → 戊子 | 2 | 0時（子の刻）テスト |
| 庚子 → 丙子 | 2 | 0時（子の刻）テスト |
| 甲子 → 庚子 | 3 | 0時（子の刻）テスト |

**発見**: 特に子の刻（23時-1時）と午の刻（11時-13時）で不一致が顕著。日干に基づく時干マッピングの韓国式特殊ルールが考慮されていない。

## 3. 検証結果からの発見

1. **立春日前後の年柱計算問題**
   - 現象: 立春日（2月4日前後）での年柱変化が正確に計算されていない
   - 原因: 立春の正確な時刻が考慮されておらず、日付だけで年柱を切り替えている
   - 例: 2023年2月3日と2月4日の年柱が同じになっている

2. **節気境界での月柱計算問題**
   - 現象: 節気変化の日における月柱計算が不正確
   - 原因: 節気の正確な時刻を考慮せず、また節気と月柱の関係を正確に実装していない
   - 例: 立夏前後（5月5-6日）の月柱が期待値と異なる

3. **日柱計算の根本的問題**
   - 現象: 日柱の一致率が極めて低い
   - 原因: 日柱計算の韓国式アルゴリズムが正確に実装されていない可能性
   - 例: ほとんどの日柱が期待値と一致しない

4. **時柱計算の特殊ルール未実装**
   - 現象: 日干に基づく時干決定の特殊ルールが反映されていない
   - 原因: 韓国式四柱推命における日干と時柱の関係性が実装されていない
   - 例: 特に子の刻と午の刻で不一致が多い

5. **地方時調整の精度問題**
   - 現象: 地域差（東京とソウル）での計算結果に不一致がある
   - 原因: 経度に基づく地方時調整が精密に行われていない
   - 例: 同日同時刻でも地域による差異が期待値と一致しない

## 4. 改善計画

### 4.1 specialCaseHandler.tsの実装

```typescript
// 特殊ケースハンドラー実装案
export class SpecialCaseHandler {
  /**
   * 立春日の特殊処理
   * @param date 日付
   * @param solarTerms 節気情報
   * @returns 調整された年干支
   */
  static handleLiChun(date: Date, solarTerms: any): { 
    shouldUseLastYearStem: boolean,
    shouldUseLastYearBranch: boolean 
  } {
    // 立春の正確な時刻を取得
    const liChunInfo = this.getLiChunExactTime(date.getFullYear());
    const liChunDate = liChunInfo.date;
    const liChunTime = liChunInfo.time;
    
    // 立春時刻以前なら前年の干支を使用
    if (date < new Date(`${liChunDate}T${liChunTime}`)) {
      return { 
        shouldUseLastYearStem: true, 
        shouldUseLastYearBranch: true 
      };
    }
    
    return { 
      shouldUseLastYearStem: false, 
      shouldUseLastYearBranch: false 
    };
  }
  
  /**
   * 節気境界での月柱特殊処理
   * @param date 日付
   * @param solarTerms 節気情報
   * @returns 調整された月干支
   */
  static handleSolarTermBoundary(date: Date, solarTerms: any): {
    adjustedSolarTerm: number,
    adjustedSolarTermName: string
  } {
    // 節気の正確な時刻を取得
    const currentSolarTerm = this.getCurrentSolarTerm(date);
    const nextSolarTerm = this.getNextSolarTerm(date);
    
    // 節気変化の境界付近での調整
    if (this.isNearSolarTermBoundary(date, nextSolarTerm)) {
      // 特殊ルールに基づく調整
      return {
        adjustedSolarTerm: this.determineCorrectSolarTerm(date, currentSolarTerm, nextSolarTerm),
        adjustedSolarTermName: this.getSolarTermName(this.determineCorrectSolarTerm(date, currentSolarTerm, nextSolarTerm))
      };
    }
    
    return {
      adjustedSolarTerm: currentSolarTerm.index,
      adjustedSolarTermName: currentSolarTerm.name
    };
  }
  
  /**
   * 韓国式時柱計算の特殊ルール適用
   * @param dayStem 日干
   * @param hourBranch 時支
   * @returns 調整された時干
   */
  static handleKoreanHourStem(dayStem: string, hourBranch: string): string {
    // 韓国式時柱計算表（日干と時支に基づく時干マッピング）
    const koreanHourStemMap: Record<string, Record<string, string>> = {
      '甲': { '子': '甲', '丑': '乙', '寅': '丙', '卯': '丁', '辰': '戊', '巳': '己', '午': '庚', '未': '辛', '申': '壬', '酉': '癸', '戌': '甲', '亥': '乙' },
      '乙': { '子': '丙', '丑': '丁', '寅': '戊', '卯': '己', '辰': '庚', '巳': '辛', '午': '壬', '未': '癸', '申': '甲', '酉': '乙', '戌': '丙', '亥': '丁' },
      '丙': { '子': '戊', '丑': '己', '寅': '庚', '卯': '辛', '辰': '壬', '巳': '癸', '午': '甲', '未': '乙', '申': '丙', '酉': '丁', '戌': '戊', '亥': '己' },
      '丁': { '子': '庚', '丑': '辛', '寅': '壬', '卯': '癸', '辰': '甲', '巳': '乙', '午': '丙', '未': '丁', '申': '戊', '酉': '己', '戌': '庚', '亥': '辛' },
      '戊': { '子': '壬', '丑': '癸', '寅': '甲', '卯': '乙', '辰': '丙', '巳': '丁', '午': '戊', '未': '己', '申': '庚', '酉': '辛', '戌': '壬', '亥': '癸' },
      '己': { '子': '甲', '丑': '乙', '寅': '丙', '卯': '丁', '辰': '戊', '巳': '己', '午': '庚', '未': '辛', '申': '壬', '酉': '癸', '戌': '甲', '亥': '乙' },
      '庚': { '子': '丙', '丑': '丁', '寅': '戊', '卯': '己', '辰': '庚', '巳': '辛', '午': '壬', '未': '癸', '申': '甲', '酉': '乙', '戌': '丙', '亥': '丁' },
      '辛': { '子': '戊', '丑': '己', '寅': '庚', '卯': '辛', '辰': '壬', '巳': '癸', '午': '甲', '未': '乙', '申': '丙', '酉': '丁', '戌': '戊', '亥': '己' },
      '壬': { '子': '庚', '丑': '辛', '寅': '壬', '卯': '癸', '辰': '甲', '巳': '乙', '午': '丙', '未': '丁', '申': '戊', '酉': '己', '戌': '庚', '亥': '辛' },
      '癸': { '子': '壬', '丑': '癸', '寅': '甲', '卯': '乙', '辰': '丙', '巳': '丁', '午': '戊', '未': '己', '申': '庚', '酉': '辛', '戌': '壬', '亥': '癸' }
    };
    
    // マッピングから時干を取得
    if (koreanHourStemMap[dayStem] && koreanHourStemMap[dayStem][hourBranch]) {
      return koreanHourStemMap[dayStem][hourBranch];
    }
    
    // 万一マッピングがない場合のフォールバック
    return '??';
  }
  
  // その他のユーティリティメソッド
  // ...
}
```

### 4.2 DateTimeProcessor精密化

```typescript
/**
 * 精密な地方時調整を行うDateTimeProcessor拡張
 */
export class EnhancedDateTimeProcessor extends DateTimeProcessor {
  /**
   * 経度に基づく精密な地方時調整
   * @param date 日付
   * @param longitude 経度
   * @returns 調整された日時
   */
  adjustToLocalTimeWithPrecision(date: Date, longitude: number): Date {
    // 標準子午線（東経135度が日本標準時、東経127.5度が韓国標準時）
    const standardMeridian = this.getStandardMeridian(longitude);
    
    // 経度による時差（分単位、小数点以下も保持）
    const timeDifferenceMinutes = (longitude - standardMeridian) * 4;
    
    // ミリ秒単位での調整（精度向上）
    const timeDifferenceMs = timeDifferenceMinutes * 60 * 1000;
    
    // 新しい日時オブジェクトを作成して調整
    const adjustedDate = new Date(date.getTime() + timeDifferenceMs);
    
    return adjustedDate;
  }
  
  /**
   * 経度に基づく標準子午線を取得
   * @param longitude 経度
   * @returns 標準子午線の経度
   */
  getStandardMeridian(longitude: number): number {
    // アジア地域の標準子午線
    if (longitude > 112.5 && longitude <= 127.5) {
      return 120; // 中国標準時
    } else if (longitude > 127.5 && longitude <= 142.5) {
      return 135; // 日本標準時
    } else if (longitude > 97.5 && longitude <= 112.5) {
      return 105; // インドシナ標準時
    }
    
    // その他のケース（デフォルトは日本標準時）
    return 135;
  }
  
  /**
   * 立春時刻を正確に計算
   * @param year 年
   * @returns 立春の日付と時刻
   */
  calculateLiChunExactTime(year: number): { date: string, time: string } {
    // 立春時刻の計算（天文アルゴリズムによる）
    // 注: 実際には天文計算ライブラリを使用するか、
    // 年ごとの立春時刻テーブルを参照することが推奨されます
    
    // 簡易版（例のみ）
    const liChunTimes: Record<number, { date: string, time: string }> = {
      2023: { date: '2023-02-04', time: '11:42:00' },
      2024: { date: '2024-02-04', time: '05:27:00' },
      // その他の年...
    };
    
    return liChunTimes[year] || { date: `${year}-02-04`, time: '11:00:00' };
  }
}
```

### 4.3 日柱計算の改善

```typescript
/**
 * 韓国式日柱計算の改善実装
 */
export class KoreanDayPillarCalculator {
  /**
   * 韓国式日柱計算
   * @param date 日付
   * @returns 日柱（天干地支）
   */
  calculateDayPillar(date: Date): { stem: string, branch: string } {
    // 元のロジックを保持しつつ、韓国式特殊ルールを適用
    
    // 基準日からの日数を計算
    const baseDate = new Date(1900, 0, 1);
    const daysDiff = this.calculateDaysDifference(baseDate, date);
    
    // 60干支サイクルに基づく日干支インデックス
    const dayIndex = (daysDiff + 10) % 60;
    
    // 干支テーブルから日柱を取得
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    const stemIndex = dayIndex % 10;
    const branchIndex = dayIndex % 12;
    
    // 韓国式特殊ルールを適用（必要に応じて）
    
    return {
      stem: stems[stemIndex],
      branch: branches[branchIndex]
    };
  }
  
  /**
   * 二つの日付間の日数差を計算
   * @param date1 日付1
   * @param date2 日付2
   * @returns 日数差
   */
  calculateDaysDifference(date1: Date, date2: Date): number {
    // 時間部分を無視して日付のみで計算
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    
    // ミリ秒単位での差を日数に変換
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 日付2が日付1より前の場合、負の値を返す
    return d2 >= d1 ? diffDays : -diffDays;
  }
}
```

## 5. 検証計画

1. **立春日特殊処理検証**
   - 2022年、2023年、2024年の2月3日〜5日の各時間帯でテスト
   - 特に立春時刻の前後でのテストを集中的に実施

2. **節気境界月柱検証**
   - 24節気の各境界日前後でのテスト
   - 特に「立夏」「立秋」「立冬」などの主要節気に注目

3. **日柱計算精度検証**
   - 連続する7日間のテストを複数月で実施
   - 月末から月初にかけての日付変化を重点的に検証

4. **時柱計算特殊ルール検証**
   - 各日干（甲〜癸）に対する各時刻の時柱計算を検証
   - 特に子刻と午刻を重点的にテスト

5. **地方時調整精度検証**
   - 同一日時の東京とソウルでの計算結果比較
   - 日付変更線近くの地域でのテスト

## 6. 結論

現在のSajuEngineの実装は基本的な骨格はできているものの、韓国式四柱推命の多くの特殊ルールに対応できていないため、全体的な精度が低い状況です。特に以下の点に注力して改善する必要があります：

1. 立春時刻を正確に考慮した年柱計算
2. 節気境界での正確な月柱計算
3. 韓国式日柱計算の精度向上
4. 日干に基づく時柱計算の特殊ルール実装
5. 精密な地方時調整の実装

これらの改善を実施することで、SajuEngineの精度を現在の46%から90%以上に向上させることが期待できます。