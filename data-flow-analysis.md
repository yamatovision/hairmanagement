# データフロー分析と問題点

## 概要

ユーザーの運勢生成と表示の連携におけるデータフローを分析し、連携における問題点を特定しました。一連の流れは以下のようになっています：

1. `/profile` でユーザーが生年月日を登録し、四柱推命（サジュ）プロファイルが生成される
2. `/fortune` で今日の運勢が表示される
3. `/conversation` で今日の運勢に基づいたAI対話が行われる

## データベース構造

MongoDBには主に以下のコレクションが存在します：

- `users`: ユーザー情報を保存（四柱推命プロファイルを含む）
- `fortunes`: 日次の運勢情報を保存
- `conversations`: ユーザーとAIの会話履歴を保存
- `teams`: チーム情報を保存
- `dailycalendarinfos`: 日付ごとの暦情報を保存
- `subscriptions`: サブスクリプション情報を保存

## 1. 四柱推命プロファイル生成フロー

### 処理フロー
1. フロントエンド（ProfileForm.tsx）からユーザー情報（birthDate, birthHour, birthLocation）が送信される
2. バックエンド（auth.controller.ts）でリクエストを受け、sajuCalculatorService.calculateSajuProfile()を呼び出す
3. 計算結果がUserモデルのsajuProfileフィールドに保存される

### 確認結果
- admin@example.comユーザーにはsajuProfileが正常に保存されている（四柱、十神関係、地支十神含む）
```json
"sajuProfile": {
    "fourPillars": {
      "yearPillar": {
        "stem": "丙",
        "branch": "寅",
        "fullStemBranch": "丙寅",
        ...
      },
      ...
    },
    "mainElement": "金",
    "yinYang": "陽",
    "tenGods": { "year": "偏官", "month": "傷官", "day": "比肩", "hour": "正印" },
    ...
}
```

## 2. デイリーフォーチュン生成フロー

### 処理フロー
1. フロントエンド（FortuneContext.tsx）からAPIリクエスト（/api/fortune/daily）が送信される
2. バックエンド（fortune.controller.ts）がリクエストを受け、elementalCalculatorServiceを呼び出す
3. fortuneRepositoryを通じてデータベースからフォーチュンデータを取得または生成
4. sajuCalculatorServiceを使って四柱推命情報でフォーチュンを拡張
5. DailyFortuneServiceでAIアドバイスも生成
6. 結果がfortunes コレクションに保存され、フロントエンドに返される

### 確認結果
- fortunesコレクションには過去のデータが保存されているが、最新データが必ずしも取得できていない
- aiGeneratedAdviceの構造が時々欠落している
- 四柱推命情報との連携において、地支十神情報（branchTenGod）が適切に反映されていない場合がある

## 3. 会話フロー

### 処理フロー
1. フロントエンド（DirectChatInterface.tsx）からメッセージが送信される
2. バックエンド（direct-chat.ts または conversation.controller.ts）でリクエストを処理
3. SystemMessageBuilderServiceが四柱推命情報を含むシステムメッセージを構築
4. Claude AIにリクエストを送信し、応答を取得
5. 会話履歴がconversationsコレクションに保存される

### 確認結果
- SystemMessageBuilderServiceは四柱推命情報を取得しようとするが、十神情報や地支十神情報が一部欠けることがある
- direct-chat.tsとconversation.controller.tsの2つの実装があり、混乱の原因となっている
- conversationsコレクションにはメッセージが正しく保存されるが、コンテキスト情報の連携が不十分な場合がある

## 主要な問題点

1. **データ不整合の問題**:
   - 四柱推命プロファイル情報は保存されているが、運勢生成時に一部の情報（特に地支十神情報）が欠落することがある
   - fortunesコレクションに保存される運勢データとsajuData連携の一貫性が欠けている

2. **API実装の重複**:
   - 会話機能に関して、direct-chat.tsとconversation.controller.tsの2つの実装が並存している
   - SystemMessageBuilder実装の不整合がある

3. **データモデルの構造的問題**:
   - 四柱推命情報の構造（User.sajuProfile）と、運勢データ（Fortune）の構造に一貫性がない
   - branchTenGods情報の扱いが統一されていない

4. **dailycalendarinfosコレクションの活用不足**:
   - dailycalendarinfoが「今日」の日付で作成されていない（nullになっている）
   - 暦情報とフォーチュン生成の連携が不十分

## 改善実施状況 (2025/04/05更新)

1. **データモデルの標準化**:
   - ✅ User.sajuProfile構造を標準化し、elementalTypeとの重複を解消 
   - ✅ 十神情報と地支十神情報の表現を統一 (Map → Record<PillarType, TenGodType>)
   - ✅ Fortune.modelにsajuDataフィールドとdailyCalendarInfoIdを追加
   - ✅ aiGeneratedAdvice構造をより厳格に定義 (summaryMarkdown)
   - ✅ DailyCalendarInfo.modelに五行・陰陽情報を明示的に追加
   - ✅ migrate-elemental-to-saju.jsスクリプトを作成して既存データを移行

2. **次のステップ**:
   - ⬜ DailyCalendarInfoServiceの実装
   - ⬜ DailyFortuneServiceからDailyCalendarInfoを活用する改修
   - ⬜ SystemMessageBuilderServiceでの地支十神情報の完全な伝達
   - ⬜ 会話システムの統一

## 検証方法

以下のステップで各機能を検証しました：

1. **サインアップ・ログインフロー**:
   - admin@example.com / admin123 でログイン
   - MongoDB内のusersコレクションでsajuProfile確認

2. **フォーチュン生成フロー**:
   - /fortune ページにアクセス
   - MongoDB内のfortunesコレクション確認
   - APIレスポンスのJSON構造確認

3. **会話フロー**:
   - /conversation ページでAIと対話
   - MongoDB内のconversationsコレクション確認
   - システムメッセージのログ確認

## 結論

ユーザー情報（四柱推命プロファイル）、運勢情報、会話情報の3つの主要データフローにおいて、部分的に連携が不完全な箇所がありました。フェーズ1でデータモデルの標準化を実施し、型定義の厳格化と構造の最適化を行いました。次のフェーズではサービス層の改善とデータフロー強化を行う予定です。