# デイリーフォーチュン画面 要件定義書

## 概要

デイリーフォーチュン画面は、ユーザーの四柱推命に基づいた日々の運勢と、その日の活動に対するアドバイスを提供するコア機能です。五行に基づいた命式相性計算により、ユーザーにとって最適な行動指針を視覚的に直感的に伝えます。

## 実装状況調査（2025/4/4追加）

### 現在の問題点

1. **ラッキーポイント表示の不具合**：
   - UIはモックアップ通りに実装されているが、ラッキーポイント表示が時々表示されない
   - フロントエンド側でのUI条件分岐は修正済み（デフォルト値を使用して常に表示）
   - しかし、バックエンドからの応答にAIで生成された`aiGeneratedAdvice`が含まれていない場合がある

2. **AIレスポンス生成の課題**：
   - バックエンドでAI呼び出しが実際に行われているか不明
   - モックデータが使用されている可能性がある
   - AIサービス連携の設定やエラーハンドリングの状態確認が必要

### 必要な調査項目

1. **バックエンドログの詳細調査**：
   - AIサービス呼び出しのログ（成功/失敗）
   - API実行時のパラメータと応答内容
   - エラーケースの特定と頻度
   - パース処理の成功率

2. **データベース状態の検証**：
   - MongoDB内の運勢データ構造
   - 既存の運勢データのフォーマット
   - `aiGeneratedAdvice`フィールドの有無と内容
   - 保存されたデータの再利用状況

3. **AIサービス連携の確認**：
   - 実際のAPI呼び出し頻度
   - レート制限やクォータの状態
   - 応答時間と処理性能
   - 失敗時のリトライ処理

### 改善実装計画

1. **フロントエンド改善（完了）**：
   - ラッキーポイント表示のデフォルト値設定
   - 条件分岐の修正による表示の安定化
   - デバッグログの強化

2. **バックエンド改善（予定）**：
   - AIサービス呼び出しの詳細ロギング追加
   - エラーハンドリングと再試行ロジックの強化
   - オプションパラメータによる強制再生成機能
   - パース処理の堅牢性向上

3. **データ検証と修正（予定）**：
   - MongoDB内の運勢データ監査
   - 不完全なデータの特定と修正
   - 構造化データフォーマットの一貫性確保

## デザイン思想

ジョナサン・アイブの美学に基づき、以下の原則に従います：

1. **シンプルさと明確さ**：不要な装飾を避け、本質的な情報を優先
2. **情報の階層**：視覚的階層により重要度を直感的に伝える
3. **適切な余白**：コンテンツに「呼吸」を与え、理解を助ける
4. **微細なインタラクション**：小さな動きが大きな体験の違いを生む
5. **統一された視覚言語**：五行属性（木・火・土・金・水）の一貫した表現

## 主要コンポーネント

### 1. 運勢概要カード

**目的**：今日の運勢の概要を簡潔に伝える

**要素**：
- 今日の日付表示
- 支配的な五行エネルギー（木・火・土・金・水）の視覚的表現
- 運勢スコア（0-100）と命式との相性の視覚化
- 今日のポイント（イメージと感情を喚起する直感的な説明文、「あなたは今日、〇〇のような運気です」という形式）
- ラッキーポイント（五行理論に基づいた開運要素）
  - ラッキーカラー（その日の五行に対応する色）
  - ラッキーアイテム（その日の五行エネルギーを活かすアイテム）
  - ラッキーナンバー（五行相関に基づく数字）
  - 開運アクション（五行エネルギーを活性化する行動）

**技術仕様**：
- 五行属性に応じたカラーコードを使用
- スコアを円形チャートで可視化
- エネルギーの属性を背景グラデーションで表現
- ラッキーポイントは星マークなどの視覚要素で強調
- 親しみやすい表現で、五行理論に基づいた確かな裏付けのある内容を提供

### 2. 命式相性スコア表示

**目的**：ユーザーの命式と今日の干支の相性度を数値化

**要素**：
- 命式との相性スコア（0-70）
- 五行バランス補完スコア（0-30）
- 合計スコア（0-100）の視覚的表示

**算出方法**：
- 命式相性：ユーザーの日柱と当日の干支の十神関係に基づく計算
- 五行バランス：ユーザーの命式で不足している五行が補われる度合い

### 3. 目標へのアドバイス

**目的**：ユーザーの設定した目標達成に向けた日々のアドバイス提供

**要素**：
- 個人目標へのアドバイス
- チーム目標へのアドバイス
- 今日の五行エネルギーを活かした具体的なアプローチ提案

**表示内容**：
- 目標内容の表示（ユーザーが設定した内容）
- 目標に対する今日の取り組み方の提案

### 4. AIアシスタント連携

**目的**：より詳細なパーソナライズドアドバイスを提供

**要素**：
- AIアシスタントへの相談ボタン
- 今日の五行エネルギーを踏まえた専門的アドバイス

**インタラクション**：
- ワンクリックでAIとの対話セッションを開始
- 対話内容はユーザーの命式と今日の五行特性に基づく

### 5. 運勢カレンダー

**目的**：未来の運勢傾向を把握し計画をサポート

**要素**：
- 週間・月間の運勢カレンダー表示
- 日々の五行属性の色による視覚化
- 運勢スコア（0-100）の数値表示

**表示方法**：
- 各日付マスに五行属性を色で表現（木：緑、火：赤、土：黄、金：金色、水：青）
- 相性スコアを数値で表示
- クリック可能で詳細表示が可能

## データ要件

1. **ユーザープロファイル連携**：
   - 生年月日時からの命式計算
   - 個人・チーム目標のデータ取得

2. **五行データ算出**：
   - 日々の干支計算（日柱）
   - 五行相性マトリクス参照
   - 十神関係の判定
   - 地支十神関係（branchTenGods）の計算と活用

3. **運勢スコア計算**：
   - 命式との相性スコア（0-70点）
   - 五行バランス補完スコア（0-30点）
   - 合計スコア算出（0-100点）
   - 注：分野別スコア（仕事/チーム関係/健康/コミュニケーション）は2025/4/3に削除され、ラッキーポイントに置き換えられました

4. **AIアドバイス生成**：
   - 構造化されたaiGeneratedAdviceオブジェクト
   - summary：イメージと感情を喚起する直感的な運勢説明（100-150文字）
   - personalAdvice：個人目標へのアドバイス（80-100文字）
   - teamAdvice：チーム目標へのアドバイス（80-100文字）
   - luckyPoints：開運ポイント（色、アイテム、数字、行動）

5. **カレンダーデータ**：
   - 最大30日分の運勢予測データ
   - 各日の五行属性と相性スコア

## 非機能要件

1. **パフォーマンス**：
   - 初期表示は1秒以内に完了
   - カレンダー切替は0.5秒以内

2. **レスポンシブ対応**：
   - スマートフォン、タブレット、デスクトップに対応
   - 画面サイズに応じたレイアウト最適化

3. **アクセシビリティ**：
   - 色覚多様性に配慮したコントラスト
   - スクリーンリーダー対応のARIA属性

4. **オフライン対応**：
   - 基本データをローカルストレージに保存
   - オフライン時には直近のデータを表示

## 実装上の注意点

1. **五行属性の視覚表現**：
   - 色だけでなく、数値も併記して情報を補完
   - 文化的背景に配慮した色彩選択

2. **相性スコアの表現**：
   - ネガティブな表現を避ける（「悪い日」ではなく「○○に向く日」）
   - スコアが低い日にも建設的なアドバイスを提供

3. **カレンダーUI**：
   - 月をまたぐ場合の前月・翌月日付の適切な表示
   - 週間・月間の切替機能

4. **AIアシスタント連携**：
   - コンテキスト情報（運勢データ）をAIに適切に渡す仕組み
   - 運勢の特性に合わせたAIプロンプト設計

## 技術スタック

1. **フロントエンド**：
   - React + TypeScript
   - Material UI コンポーネント
   - Chart.jsによる視覚化

2. **API連携**：
   - 運勢計算エンドポイント
   - ユーザープロファイルAPI
   - AIアシスタントAPI

3. **データキャッシュ**：
   - IndexedDBを使用した運勢データの保存
   - 30日分のデータをプリフェッチ

## 実装状況（2025/4/4 更新）

### 完了済み項目
1. **UI基本実装**
   - デイリーフォーチュンカードのモックアップベースUI実装
   - 運勢カレンダーの週間/月間切替UI
   - チームヒントUI
   - ボトムナビゲーション
   - ページ遷移と詳細表示切替
   - 五行属性に応じた視覚的表現の一貫性確保
   - アニメーションとインタラクション

2. **デザイン要素**
   - 円形チャートによる運勢スコア表示
   - プログレスバーによる命式相性/五行バランス表示
   - 五行属性に対応したグラデーションとスタイル
   - レスポンシブデザイン対応
   - グリッドレイアウトによるラッキーポイント表示の最適化
   
3. **AIアドバイス機能**
   - 構造化されたaiGeneratedAdviceオブジェクトの実装
   - ラッキーポイント（カラー、アイテム、数字、開運アクション）の洗練された視覚表現
   - AIプロンプトの最適化
   - パース処理の強化
   - 多様なカラーバリエーションのサポート（赤、青、緑、黄、白、紫、茶、オレンジ、ピンク、金、銀）

4. **バックエンド連携**
   - 構造化された運勢データのAPI連携
   - 新旧形式のデータ互換性対応
   - エラーハンドリングと再試行機能
   - データタイプ安全性の強化（配列チェック、デフォルト値設定など）
   - 詳細なデバッグログ機能
   - API統合テストスクリプトの実装

5. **エラー耐性と堅牢性**
   - ラッキーアイテム配列の安全な処理
   - データ欠損時のフォールバックメカニズム
   - コンディショナルレンダリングによる表示切替
   - TypeScript型チェックの活用

### 未完了・開発中項目
1. **APIとの連携**
   - パフォーマンス最適化
   - オフラインモード強化

2. **機能の実装**
   - AIアシスタント連携ボタンの機能実装
   - カレンダーでの日付選択による詳細表示
   - ユーザー目標との連携強化

## 実装計画 - API連携ロードマップ

### フェーズ1: 基本データ連携（優先度：高）
1. **デイリー運勢データ取得**
   - 必要なバックエンドAPI:
     - `GET /api/fortune/daily` - 今日の運勢データ取得
     - データ形式の定義と標準化（五行属性、スコア、アドバイステキスト）
   - 実装タスク:
     - フロントエンドでのAPI接続実装
     - 運勢データの表示コンポーネントへの反映
     - ローディング状態とエラー処理

### フェーズ2: カレンダー機能（優先度：中）
1. **週間・月間データ取得**
   - 必要なバックエンドAPI:
     - `GET /api/fortune/range?startDate={date}&endDate={date}` - 期間指定運勢取得
   - 実装タスク:
     - 週間/月間データの一括取得
     - カレンダーUIへのデータマッピング
     - 日付選択時の詳細データ表示

### フェーズ3: チーム連携（優先度：中）
1. **チームメンバー相性データ**
   - 必要なバックエンドAPI:
     - `GET /api/team/compatibility?date={date}` - チーム相性データ取得
   - 実装タスク:
     - チームヒントへのデータ反映
     - 相性の良いメンバーのリスト表示
     - チームメンバーとのアクション提案

### フェーズ4: AIアシスタント連携（優先度：低）
1. **AI対話機能**
   - 必要なバックエンドAPI:
     - `POST /api/conversation/fortune` - 運勢データを含めたAI対話
   - 実装タスク:
     - AI相談ボタンのイベントハンドラ実装
     - 対話画面への遷移
     - 運勢コンテキストの対話への統合

## バックエンド側で決定が必要な事項

### 1. データスキーマ
- **運勢データの標準化**
  - 五行属性の表現方法（日本語/漢字/英語）の一貫性
  - スコア計算のアルゴリズム共通化（フロントでの計算か、バックエンドでの計算か）
  - 日付形式の統一（ISO 8601形式推奨）

### 2. 計算ロジック
- **運勢スコア計算**
  - 命式相性スコア（70点）と五行バランス（30点）の具体的計算方法
  - 四柱推命データとの連携方法
  - 十神関係に基づく相性度の算出アルゴリズム

### 3. 最適化とキャッシュ戦略
- **データ取得の効率化**
  - 一度に取得するカレンダーデータの範囲（7日/30日）
  - キャッシュ有効期限の設定
  - バックグラウンド更新の仕組み

### 4. チームデータ連携
- **チームメンバーの五行属性管理**
  - ユーザープロファイルと命式情報の連携
  - チーム内の相性データの計算タイミング
  - プライバシー考慮点

## 実装優先順位とスケジュール

1. **優先度高（2週間以内）**
   - デイリー運勢データ取得APIの実装
   - フロントエンドでの基本データ表示
   - エラーハンドリングとフォールバック表示

2. **優先度中（1ヶ月以内）**
   - カレンダーデータ取得APIの実装
   - チーム相性データの基本表示
   - テストとバグ修正

3. **優先度低（2ヶ月以内）**
   - AIアシスタント連携
   - オフラインサポート
   - パフォーマンス最適化

## 将来的な拡張計画

1. **全体運勢傾向グラフ**：
   - 月間、年間の運勢傾向をグラフ化
   - パターン分析による長期アドバイス

2. **チーム運勢連携の高度化**：
   - チームメンバー間の詳細相性スコア
   - チーム全体の運勢合成表示
   - 最適チーム編成提案

3. **カスタムアラート**：
   - 特定スコア以上の日の通知設定
   - 重要イベント前の運勢確認リマインダー
   - カレンダー連携機能

## 関連ファイル一覧

### フロントエンド

#### コンポーネント
- `/frontend/src/components/fortune/DailyFortune.tsx` - デイリー運勢カードコンポーネント
- `/frontend/src/components/fortune/FortuneCalendar.tsx` - 運勢カレンダーコンポーネント
- `/frontend/src/components/fortune/FortuneDetail.tsx` - 運勢詳細表示コンポーネント
- `/frontend/src/components/fortune/DailyFortuneView.tsx` - 運勢ビューコンポーネント（未実装）

#### ページ
- `/frontend/src/pages/DailyFortunePage.tsx` - デイリーフォーチュンページ

#### コンテキスト・フック
- `/frontend/src/contexts/FortuneContext.tsx` - 運勢状態管理コンテキスト
- `/frontend/src/hooks/useFortune.ts` - 運勢機能用カスタムフック

#### サービス
- `/frontend/src/services/fortune.service.ts` - バックエンドAPI接続サービス

#### 型定義
- `/frontend/src/types/models.ts` - 運勢データモデル型定義
- `/frontend/src/utils/sharedTypes.ts` - 共通型定義

### バックエンド

#### コントローラー
- `/backend/src/interfaces/http/controllers/fortune.controller.ts` - 運勢APIコントローラー

#### サービス
- `/backend/src/application/services/saju-calculator.service.ts` - 四柱推命計算サービス
- `/backend/src/application/services/daily-fortune.service.ts` - デイリー運勢サービス

#### リポジトリ
- `/backend/src/infrastructure/repositories/MongoFortuneRepository.ts` - 運勢データリポジトリ

#### ルート
- `/backend/src/interfaces/http/routes/fortune.routes.ts` - 運勢APIルート定義

#### ユーティリティ
- `/backend/src/utils/saju/refactored/SajuEngine.ts` - 四柱推命エンジン
- `/backend/src/utils/saju/refactored/tenGodCalculator.ts` - 十神計算ロジック



⏺ デイリーフォーチュン画面 API連携技術仕様書

  1. 概要

  デイリーフォーチュン機能は、ユーザーの四柱推命プロファイルと現在の日柱を照合
  し、個人化された運勢情報とアドバイスを提供します。本仕様書では、フロントエン
  ドとバックエンドの連携方法、データフロー、および最適化戦略について詳述します
  。

  2. システムアーキテクチャ

  2.1 全体構成

  [フロントエンド]        [バックエンド]            [データベース]
     React App  ←→  Express/Node.js API  ←→  MongoDB / Redis
       │                   │                      │
  DailyFortune.tsx    FortuneController      UserCollection
  FortuneContext.tsx  SajuCalculatorService  FortuneCollection
  useFortune.ts       DailyFortuneService

  2.2 データフロー概要

  1. ユーザー登録時に四柱推命プロファイルを計算し保存
  2. デイリーフォーチュン表示時に運勢データをリクエスト
  3. バックエンドで運勢データを生成または取得
  4. 運勢データをフロントエンドに返却して表示

  3. ユーザー登録・プロファイル処理

  3.1 四柱推命プロファイル計算

  // user-registration.use-case.ts
  async execute(registrationData: RegistrationRequest): Promise<User> {
    // バリデーション処理

    // 四柱推命プロファイル計算
    const birthDate = new Date(registrationData.birthDate);
    const birthHour = registrationData.birthHour || 12;
    const birthLocation = registrationData.birthLocation;

    const sajuProfile = await this.sajuCalculatorService.calculateSajuProfile(
      birthDate, birthHour, birthLocation
    );

    // ユーザー作成時に四柱推命プロファイルを含める
    const user = await this.userRepository.create({
      ...registrationData,
      sajuProfile: sajuProfile.toPlain(),
      password: await this.encryptPassword(registrationData.password)
    });

    return user;
  }

  3.2 MongoDB ユーザーモデル設計

  // user.model.ts
  const userSchema = new Schema({
    // 基本情報
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },

    // 生年月日情報
    birthDate: { type: String, required: true },
    birthHour: { type: Number, min: 0, max: 23 },
    birthLocation: { type: String },

    // 四柱推命プロファイル
    sajuProfile: {
      fourPillars: {
        yearPillar: {
          stem: String,
          branch: String,
          fullStemBranch: String,
          hiddenStems: [String]
        },
        monthPillar: {
          stem: String,
          branch: String,
          fullStemBranch: String,
          hiddenStems: [String]
        },
        dayPillar: {
          stem: String,
          branch: String,
          fullStemBranch: String,
          hiddenStems: [String]
        },
        hourPillar: {
          stem: String,
          branch: String,
          fullStemBranch: String,
          hiddenStems: [String]
        }
      },
      mainElement: String,
      secondaryElement: String,
      yinYang: String,
      tenGods: { type: Map, of: String }
    },

    // その他のユーザー情報
    // ...
  });

  4. デイリーフォーチュンAPI連携

  4.1 エンドポイント仕様

  GET /api/fortune/daily

  ユーザーの今日の運勢情報を取得します。

  認証: 必須（JWTトークン）

  リクエスト: パラメータ不要（ユーザーIDはトークンから取得）

  レスポンス:
  {
    "id": "fortune-userId-2025-04-03",
    "date": "2025-04-03",
    "overallScore": 78,
    "starRating": 4,
    "rating": "good",
    "aiGeneratedAdvice": {
      "summary": "あなたは今日、晴れ渡った空に風を受けて飛ぶ鳥のような運気です！思いがけない幸運と新しい出会いの予感があります。直感を信じれば、思わぬ発見があるでしょう。「火」のエネルギーが強まり、創造性と情熱が高まる日です。",
      "personalAdvice": "AIシステムの論理構造を見極めるのに最適な日です。直感的
  なひらめきを大切に、システムの「骨格」となる部分に焦点を当て、余分な要素を削
  ぎ落としていきましょう。",
      "teamAdvice": "チーム目標達成のため、今日は役割分担を明確にし、バイアウト
  計画の具体的なタイムラインを設定するのに最適な時期です。",
      "luckyPoints": {
        "color": "赤",
        "items": ["鈴", "明るい色の文房具"],
        "number": 8,
        "action": "朝日を浴びる"
      }
    },
    "personalGoal": "最高のAISAASを作る",
    "teamGoal": "年内30億円規模でバイアウト",
    "sajuData": {
      "mainElement": "火",
      "yinYang": "陽",
      "compatibility": 78,
      "dayMaster": "丙",
      "tenGod": "偏印",
      "earthBranch": "午",
      "dayElement": "火"
    }
  }

  4.2 バックエンド処理フロー

  // daily-fortune.service.ts
  async getDailyFortune(userId: string): Promise<FortuneResponseDTO> {
    try {
      // 1. 今日の日付を取得
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 2. 既存のフォーチュンを検索
      let fortune = await this.fortuneRepository.findByUserIdAndDate(userId,
  today);

      // 3. 存在しない場合は新規生成
      if (!fortune) {
        // 3.1 ユーザー情報を取得
        const user = await this.userRepository.findById(userId);
        if (!user) {
          throw new Error('ユーザーが見つかりません');
        }

        // 3.2 今日の四柱情報を取得
        const todaysFourPillars =
  this.sajuCalculatorService.calculateDayFourPillars();

        // 3.3 運勢評価とスコアを計算
        const compatibilityScore = this.calculateCompatibilityScore(
          user.sajuProfile,
          todaysFourPillars
        );

        // 注: 分野別スコア計算は削除されました（2025/4/3）

        // 3.5 AI運勢アドバイス生成
        const advice = await this.generateFortuneAdvice(
          user.sajuProfile,
          todaysFourPillars,
          user.personalGoal || '',
          user.teamGoal || ''
        );

        // 3.6 運勢エンティティを生成
        const newFortune = {
          userId,
          date: today,
          overallScore: compatibilityScore,
          rating: this.mapScoreToRating(compatibilityScore),
          aiGeneratedAdvice: advice,
          personalGoal: user.personalGoal || '',
          teamGoal: user.teamGoal || '',
          sajuData: {
            mainElement: user.sajuProfile.mainElement,
            yinYang: user.sajuProfile.yinYang,
            dayMaster: user.sajuProfile.fourPillars.dayPillar.stem,
            // その他のsajuData情報
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // 3.7 運勢を保存
        fortune = await this.fortuneRepository.create(newFortune);
      }

      // 4. 運勢データをDTOに変換して返す
      return this.mapToResponseDTO(fortune);
    } catch (error) {
      console.error('デイリーフォーチュン取得エラー:', error);
      throw error;
    }
  }

  4.3 AIアドバイス生成処理

  private async generateFortuneAdvice(
    userSajuProfile: any,
    todayFourPillars: any,
    personalGoal: string,
    teamGoal: string
  ): Promise<FortuneAdviceDTO> {
    try {
      // AIアドバイス生成は1ユーザーにつき1日1回のみ
      const prompt = `
  あなたは四柱推命と五行の専門家です。以下の情報に基づいて今日の運勢とアドバイスを生
  成してください。

  ## ユーザープロフィール
  - 五行属性: ${userSajuProfile.yinYang}${userSajuProfile.mainElement}
  - 四柱: ${this.formatFourPillars(userSajuProfile.fourPillars)}

  ## 今日の暦情報
  - 今日の四柱: ${this.formatFourPillars(todayFourPillars)}
  - 十神関係: 
  ${this.getTenGodRelation(userSajuProfile.fourPillars.dayPillar.stem, 
  todayFourPillars.dayPillar.stem)}

  ## 目標情報
  - 個人目標: ${personalGoal || '未設定'}
  - チーム目標: ${teamGoal || '未設定'}

  ## 出力形式
  以下の形式で出力してください：
  1. 今日のあなたの運気
  （100-150文字、具体的なイメージや比喩を使い、ポジティブな表現で。「あなたは今日、〇〇のような運気です」という形で始める）

  2. ラッキーポイント（五行理論に基づいて選定すること）
  - ラッキーカラー: （今日の五行と相性の良い色）
  - ラッキーアイテム: （1-2つ、今日の五行エネルギーを活かすアイテム）
  - ラッキーナンバー: （1-9の数字、五行相関に基づく）
  - 開運アクション: （簡単にできる具体的な行動を15-20文字で）

  3. 個人目標へのアドバイス（80-100文字、専門的で具体的なアドバイス）

  4. チーム目標へのアドバイス（80-100文字、職場での人間関係や協力に関する専門的なアドバイス）

  ※五行思想と十神関係に基づいた確かな裏付けのある内容にしてください。
  ※ラッキーポイントは表現は親しみやすくしつつも、背後には伝統的な五行理論の確かなロジックを持たせてください。
  `;

      // AIサービスでアドバイス生成
      const response = await this.aiService.generateText(prompt, { model:
  'claude-sonnet' });

      // レスポンスを解析して構造化
      const parsedAdvice = this.parseAIResponse(response);

      return parsedAdvice || {
        summary: "本日の運勢データを準備中です。",
        personalAdvice: "個人目標に向けて着実に進みましょう。",
        teamAdvice: "チームとの連携を大切にしてください。",
        actionPoints: ["基本に忠実に", "計画的に行動",
  "コミュニケーションを大切に"]
      };
    } catch (error) {
      console.error('AI運勢アドバイス生成エラー:', error);
      return {
        summary: "アドバイスの生成中にエラーが発生しました。",
        personalAdvice: "個人目標に向けて通常通り進めてください。",
        teamAdvice: "チームとの連携を通常通り進めてください。",
        actionPoints: ["基本に忠実に", "計画的に行動",
  "コミュニケーションを大切に"]
      };
    }
  }

  4.4 運勢コレクションのスキーマ設計

  // fortune.model.ts
  const fortuneSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    overallScore: { type: Number, required: true },
    rating: {
      type: String,
      enum: ['excellent', 'good', 'neutral', 'caution', 'poor'],
      required: true
    },
    // 注: 分野別カテゴリースコアは削除されました（2025/4/3）
    aiGeneratedAdvice: {
      summary: String,
      personalAdvice: String,
      teamAdvice: String,
      luckyPoints: {
        color: String,
        items: [String],
        number: Number,
        action: String
      }
    },
    personalGoal: String,
    teamGoal: String,
    sajuData: {
      mainElement: String,
      yinYang: String,
      compatibility: Number,
      dayMaster: String,
      tenGod: String,
      earthBranch: String,
      dayElement: String
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  // 複合インデックス
  fortuneSchema.index({ userId: 1, date: 1 }, { unique: true });

  5. フロントエンド実装

  5.1 FortuneContext の設計

  // FortuneContext.tsx
  export const FortuneProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children }) => {
    const [dailyFortune, setDailyFortune] = useState<IFortune | null>(null);
    const [weeklyFortunes, setWeeklyFortunes] = useState<IFortune[]>([]);
    const [selectedFortune, setSelectedFortune] = useState<IFortune |
  null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 今日の運勢取得
    const fetchDailyFortune = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fortuneService.getDailyFortune();
        setDailyFortune(response);
        return response;
      } catch (err: any) {
        setError(err.message || 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    }, []);

    // 週間運勢取得
    const fetchWeeklyFortunes = useCallback(async (startDate?: string) => {
      try {
        const response = await fortuneService.getWeeklyFortunes(startDate);
        setWeeklyFortunes(response);
      } catch (err: any) {
        console.error('週間運勢取得エラー:', err);
      }
    }, []);

    // 選択済み運勢を更新
    const selectFortune = useCallback((fortune: IFortune) => {
      setSelectedFortune(fortune);
    }, []);

    // コンテキスト値
    const contextValue = {
      dailyFortune,
      weeklyFortunes,
      selectedFortune,
      loading,
      error,
      fetchDailyFortune,
      fetchWeeklyFortunes,
      selectFortune,
      // その他のメソッド
    };

    return (
      <FortuneContext.Provider value={contextValue}>
        {children}
      </FortuneContext.Provider>
    );
  };

  5.2 DailyFortune コンポーネントの API 連携

  // DailyFortune.tsx
  const DailyFortune: React.FC<DailyFortuneProps> = ({ onClickViewDetail }) =>
  {
    const { dailyFortune, loading, error, fetchDailyFortune } = useFortune();
    const [refreshing, setRefreshing] = useState(false);

    // コンポーネントマウント時にデータ取得
    useEffect(() => {
      fetchDailyFortune();
    }, [fetchDailyFortune]);

    // データ手動更新処理
    const handleRefresh = async () => {
      setRefreshing(true);
      try {
        await fetchDailyFortune();
      } catch (error) {
        console.error('運勢更新エラー:', error);
      } finally {
        setRefreshing(false);
      }
    };

    // 読み込み中表示
    if (loading && !dailyFortune) {
      return <LoadingView />;
    }

    // エラー表示
    if (error && !dailyFortune) {
      return <ErrorView error={error} onRetry={handleRefresh} />;
    }

    // データがない場合
    if (!dailyFortune) {
      return <EmptyView onFetch={handleRefresh} />;
    }

    // JSXレンダリング
    return (
      <Card>
        {/* ...カードコンテンツ */}
        {/* データを表示する各コンポーネント */}
      </Card>
    );
  };

  6. 最適化戦略

  6.1 パフォーマンス最適化

  1. 四柱計算の最適化
    - ユーザー登録時およびプロファイル更新時のみ四柱計算実行
    - 運勢取得時は保存済みの四柱データを使用
  2. 運勢データの1日1回生成
    - 同一ユーザーの同一日付の運勢は1回のみ計算
    - 結果をMongoDBに永続化して再利用
  3. AI処理の効率化
    - 1ユーザーにつき1日1回のみAI呼び出し
    - パーソナルゴールとチームゴールを含めた一括生成

  6.2 データベース最適化

  1. インデックス設計
    - (userId, date) の複合インデックスで高速クエリ
    - 過去の運勢データのTTL設定（オプション）
  2. クエリ最適化
    - 必要なフィールドのみを取得するプロジェクション
    - 不要なデータをクエリ時に除外

  6.3 エラーハンドリングとフォールバック

  1. AI生成エラー対策
    - AI生成失敗時のフォールバックメッセージ定義
    - 常にレスポンスを返せる設計
  2. ネットワークエラー対策
    - オフライン時にはローカルキャッシュを活用
    - 緩やかなエラー回復メカニズム

  7. 実装上の注意点

  1. 環境変数と設定管理
    - AI APIキーの安全な管理
    - 環境ごとの設定切り替え
  2. スケール考慮点
    - ユーザー数増加時のパフォーマンス考慮
    - AIリクエスト量の管理と制限
  3. テスト方針
    - ユニットテスト（サービスとリポジトリ）
    - 統合テスト（エンドポイント）
    - モックデータの準備

  8. 実装ロードマップ

  1. フェーズ1: 基本実装（更新 2025/4/3）
    - ユーザー登録時の四柱プロファイル計算・保存
    - 運勢データ生成・取得エンドポイント
    - フロントエンド基本連携
    - 注: 分野別カテゴリースコア（仕事/チーム関係/健康/コミュニケーション）は仕様から削除され、ラッキーポイント（カラー、アイテム、ナンバー、アクション）に置き換えられました
    - 運勢データの更新は24:00（旧暦の日の変わり目）に自動バッチ処理で実行
  2. フェーズ2: AI統合
    - Claude Sonnet連携
    - 効率的なAIリクエスト管理
    - アドバイス生成とパース処理
  3. フェーズ3: 最適化
    - パフォーマンスチューニング
    - キャッシュ戦略実装
    - エラーハンドリング強化

  9. デバッグとモニタリング

  1. ログ設計
    - API呼び出しログ
    - AI生成ログ
    - エラーログ
  2. パフォーマンスモニタリング
    - API応答時間
    - AI呼び出し回数と時間
    - データベース操作時間

  10. 更新履歴

2025年4月4日 - ラッキーポイント表示の強化とデバッグ計画
------------------
  
**追加機能:**
- ラッキーポイント表示UIの大幅改善（グリッドレイアウト、カラー表示強化）
- 多様なカラーバリエーションのサポート（赤、青、緑、黄、白、紫、茶、オレンジ、ピンク、金、銀）
- データタイプ安全性の強化（配列チェック、デフォルト値設定など）
- API統合テストスクリプトの追加

**変更点:**
- 従来のアクションポイント表示を完全に削除し、常にラッキーポイント表示に統一
- バックエンドのレスポンスに関わらずデフォルト値を使ってラッキーポイントを表示
- デバッグログを拡充し問題特定を容易化
- エラー耐性強化（TypeScript型チェック活用、データ欠損対応）

**技術改善:**
- 堅牢なデータ処理による安全なアイテムアクセス
- レスポンシブデザイン対応の向上
- データ構造検証ロジックの改善
- フロントエンド-バックエンド統合テスト機能の追加

**調査・デバッグ計画:**
- ログ収集機能を強化しAIサービス呼び出しの成功/失敗を監視
- MongoDB内の運勢データの構造と内容を確認するスクリプト作成
- 問題の根本原因特定のためのロギングポイント追加
  1. AIサービス呼び出し前の状態
  2. AIサービス呼び出し結果の詳細
  3. AIレスポンスのパース処理結果
  4. MongoDB保存時のデータ構造
- フロントエンド-バックエンドのデータ一貫性検証ツールの作成

  2025年4月3日 - AIアドバイス機能の強化と構造化
  ------------------
  
  **追加機能:**
  - 構造化されたAIアドバイス（aiGeneratedAdvice）オブジェクトの実装
  - ラッキーポイント機能（カラー、アイテム、ナンバー、アクション）の追加
  - イメージと感情を喚起する直感的な運勢説明文の改善
  - 五行理論に基づいた開運要素の提供
  - FortuneDetailコンポーネントでのラッキーポイント視覚的表示
  
  **変更点:**
  - 分野別カテゴリースコア（仕事/チーム/健康/コミュニケーション）を削除
  - AIプロンプトを更新し、より構造化された出力形式を採用
  - パース処理を強化し、多様なAI回答形式に対応
  - レスポンスフォーマットにaiGeneratedAdviceオブジェクトを追加
  - 新旧形式の互換性を維持するフォールバックメカニズムの実装
  - 運勢データの自動更新を24:00（旧暦の日の変わり目）に設定
  
  **技術改善:**
  - 型定義の更新とTypeScript型の強化
  - AIレスポンス解析の堅牢性向上
  - ClaudeAIServiceの改善（エラーハンドリング、ロギング、モック対応）
  - テストスクリプトの更新と拡張
  - コードと要件定義の整合性確保
  - API接続エラーに対する再試行ロジックの強化
  
  **次回アップデート予定:**
  - AIアシスタント連携機能の実装
  - カレンダー機能の強化
  - ユーザー目標との連携機能の強化
  - オフラインサポートの実装
  
  この技術仕様書は、現在のコードベースの調査とシステム要件に基づき、デイリーフォーチュン機能のAPI連携を最適化するための包括的な計画を提供します。ジョブスが好むシンプルかつ効率的な実装を目指し、ユーザー体験を最優先しながらもバックエンドでの最適化を行います。




curl -s -X GET "http://0.0.0.0:5001/api/v1/fortune/daily" -H
 "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZT
Q4N2RiYzRhNThhNjJkMzhhYzZhYyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xl
IjoiYWRtaW4iLCJpYXQiOjE3MTIxNDg1MTIsImV4cCI6MTcxMjMyMTMxMn0.CuhqHdExh-VmJU
jpv_G67qYK62rCRszewfAhVZ7t26E" > /dev/null && echo "API呼び出しを実行しました。サーバーログでClaudeAIServiceの実行を確認してください"






1  # 環境設定ファイル - 本番環境相当の設定（ローカル開発用）
      2  NODE_ENV=development
      3  PORT=5001
      4  # ローカルMongoDBの設定
      5  DB_URI=mongodb://localhost:27017/patrolmanagement
      6  MONGODB_URI=mongodb://localhost:27017/patrolmanagement
      1  # Claude AI API設定
      2  CLAUDE_API_KEY=dummy-api-key
      3  CLAUDE_API_URL=https://api.anthropic.com/v1/messages
      4  CLAUDE_MODEL=claude-3-sonnet-20240229
      5 
      6  # MongoDB接続設定
      7  MONGODB_CONNECT_TIMEOUT=30000
      8  MONGODB_SOCKET_TIMEOUT=45000
      9  MONGODB_SERVER_TIMEOUT=10000
     10  
      6  # データベース設定
      7  SKIP_DB=true
      8  SKIP_DB_ERRORS=true
      7  MONGODB_URI=mongodb://localhost:27017/patrolmanagement
      8 
      9  # 機能フラグ (開発中は機能を限定的に有効化)
     10  ENABLE_AUTH=true
     11  ENABLE_FORTUNE=true
     12  ENABLE_TEAM=true
     13  ENABLE_ANALYTICS=true
     14  ENABLE_CONVERSATION=true
     15  
     16  # TypeScriptエラー無視
     17  TS_NODE_TRANSPILE_ONLY=true
     18  
     19  # 認証設定
     20  JWT_SECRET=patrol_management_jwt_secret_production_environment_2025
     21  JWT_ACCESS_EXPIRATION=1d
     22  JWT_REFRESH_EXPIRATION=7d
     23  
     24  # Claude API設定
     25  CLAUDE_API_KEY=sk-ant-api03-61lRho5J-PNx6BoluKQYcDMjM8UGjlzlh_SzAH81v
        1QRQ6dCo-J3wkMhIU6BC2l_s_lTbM55q9D-fD86EULLuw-syPxXAAA
     26  CLAUDE_API_URL=https://api.anthropic.com/v1/messages
     27  CLAUDE_MODEL=claude-3-haiku-20240307
     28  CLAUDE_TEMPERATURE=0.7
     29  CLAUDE_MAX_TOKENS=1000
     30  
     31  # API設定
     32  API_VERSION=v1
     33  API_PREFIX=/api
     34  CORS_ORIGIN=http://localhost:3000
     35  
     36  # ロギング
     37  LOG_LEVEL=debug
     38  LOG_FORMAT=simple
     39  ENABLE_REQUEST_LOGGING=true
     40  
     41  # 陰陽五行エンジン設定
     42  ELEMENT_CALCULATION_METHOD=traditional
     43  FORTUNE_GENERATION_TIME=00:00
     44  FORTUNE_TIME_ZONE=Asia/Tokyo
     45  FORTUNE_CACHE_DURATION=24
     46  
      9  # JWT設定
     10  JWT_SECRET=your-jwt-secret-key
     11  JWT_EXPIRES_IN=3d