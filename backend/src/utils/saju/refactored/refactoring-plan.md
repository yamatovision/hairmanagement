# 四柱推命計算システム リファクタリング計画

## 現状の課題

1. **複雑で冗長な計算プロセス**
   - 同様の計算が複数のモジュールで重複
   - エラー処理が複雑で入り組んでいる
   - コードの可読性が低い

2. **フラグメント化したデータフロー**
   - 地方時調整、旧暦変換、四柱計算が分断している
   - データの一貫性が維持されにくい構造

3. **外部依存と堅牢性の問題**
   - lunar-javascriptライブラリへの脆弱な依存
   - エラー発生時の回復メカニズムが不十分

4. **テスト結果から確認された具体的問題**
   - 年柱・月柱計算のエラー：SajuCalculatorで年柱と月柱がundefined
   - 旧暦変換の失敗：「無効な日付オブジェクト」エラーが頻発
   - 時間調整の問題：「Invalid time value」エラーが発生

## リファクタリングの目標

1. **シンプルで一貫性のあるデータフロー**
   - 入力 → 前処理 → 核心計算 → 後処理 → 出力 の明確なパイプライン
   - 各段階での堅牢なエラーハンドリング

2. **モジュール間の明確な責任分担**
   - 各モジュールの役割と依存関係を整理
   - インターフェースを明確にして結合度を下げる

3. **堅牢性と保守性の向上**
   - 外部依存を最小化
   - フォールバックメカニズムの強化
   - テスト可能性の向上

## リファクタリング計画

### フェーズ1: コア計算モジュールの統合

1. **SajuCalculatorの再設計**
   - コアとなるSajuEngineクラスを作成
   - 計算のステップをパイプラインとして再構成:
     ```
     InputData → AdjustedData → FourPillars → Result
     ```

2. **日付・時間処理の一元化**
   - 日付操作を`DateTimeProcessor`クラスに集約
   - 地方時調整ロジックを改善
   - 無効な日付に対する堅牢な処理

3. **旧暦変換の改善**
   - lunar-javascriptへの依存を任意に
   - 内蔵の簡易変換アルゴリズムを強化
   - キャッシュメカニズムの導入

### フェーズ2: 個別計算モジュールの最適化

1. **年柱計算の改善**
   - 年柱計算のアルゴリズム単純化
   - 特殊ケース（1970年など）の処理改善

2. **月柱計算の最適化**
   - 節気ベースの月柱計算ロジックを統一
   - 特殊ケースを最小限に抑える

3. **日柱・時柱計算の強化**
   - 日柱計算の60干支サイクルロジックを整理
   - 時柱計算との連携を改善

### フェーズ3: エラー処理とフォールバックの強化

1. **階層的エラー処理システム**
   - 段階ごとの適切なエラーハンドリング
   - 意味のあるエラーメッセージの提供

2. **フォールバックメカニズムの実装**
   - 各計算ステップで問題が発生した場合の代替計算
   - 部分的な結果でも最大限の情報を提供

3. **ロギングとデバッグの改善**
   - 詳細なログ記録
   - 問題診断のためのデバッグモード

### フェーズ4: テストとドキュメントの充実

1. **包括的テストの強化**
   - 単体テストの拡充
   - エッジケーステストの追加
   - パフォーマンステスト

2. **ドキュメント化**
   - 四柱推命計算の原理の説明
   - アルゴリズムの詳細ドキュメント
   - APIリファレンス

## 実装予定コード構造

```typescript
// 新しいモジュール構造
class SajuEngine {
  private dateProcessor: DateTimeProcessor;
  
  constructor(options?: SajuEngineOptions) {
    this.dateProcessor = new DateTimeProcessor(options);
  }
  
  calculate(birthDate: Date, birthHour: number, gender?: Gender, location?: Location): SajuResult {
    try {
      // 1. 日付・時間の前処理
      const adjustedDateTime = this.dateProcessor.adjustDateTime(birthDate, birthHour, location);
      
      // 2. 四柱の計算
      const yearPillar = this.calculateYearPillar(adjustedDateTime);
      const monthPillar = this.calculateMonthPillar(adjustedDateTime, yearPillar.stem);
      const dayPillar = this.calculateDayPillar(adjustedDateTime);
      const hourPillar = this.calculateHourPillar(adjustedDateTime, dayPillar.stem);
      
      // 3. 結果の組み立て
      return this.buildResult({
        yearPillar, monthPillar, dayPillar, hourPillar,
        adjustedDateTime, gender, location
      });
    } catch (error) {
      // エラー処理とフォールバック
      return this.handleCalculationError(error, birthDate, birthHour, gender, location);
    }
  }
  
  // その他のメソッド...
}

// 日付・時間処理専用クラス
class DateTimeProcessor {
  adjustDateTime(date: Date, hour: number, location?: Location): AdjustedDateTime {
    // 地方時調整ロジック
    // ...
  }
  
  getLunarDate(date: Date): LunarDate | null {
    // 旧暦変換（外部ライブラリあれば使用、なければ内蔵アルゴリズム）
    // ...
  }
  
  // その他のメソッド...
}
```

## リファクタリング進行手順

1. まず`DateTimeProcessor`クラスの作成から始める
2. 続いて`SajuEngine`のコア実装
3. 個別計算モジュールの最適化
4. エラー処理とフォールバックの実装
5. テストとドキュメントの充実

## 期待される成果

1. **計算の正確性向上**
   - 期待値との一致率の向上（現在の83%→95%以上へ）
   - エラーケースの大幅削減

2. **保守性の向上**
   - コードの可読性の向上
   - 修正・拡張の容易さ

3. **堅牢性の向上**
   - 不正な入力への対応力向上
   - 依存ライブラリに問題があっても機能する

4. **パフォーマンスの最適化**
   - 不要な計算の排除
   - キャッシュ機構の活用