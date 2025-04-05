# データモデル分析

## 概要

パトロールマネジメントアプリケーションのデータモデルと関連する問題点を分析し、モデル間の関係性および改善点を明確にしました。本分析では特に四柱推命（サジュ）情報と運勢データの連携に焦点を当てています。

## データベース構造

### 主要コレクション
- `users`: ユーザー情報（四柱推命プロファイル含む）
- `fortunes`: 日次の運勢情報
- `conversations`: AI会話履歴
- `teams`: チーム情報
- `dailycalendarinfos`: 日付ごとの暦情報 
- `subscriptions`: サブスクリプション情報

## User モデル（users コレクション）

### 現状構造
```javascript
{
  _id: ObjectId,
  email: String,
  password: String,
  name: String,
  birthDate: String,
  birthHour: Number,
  birthLocation: String,
  role: String,
  elementalType: {
    mainElement: String,    // '木', '火', '土', '金', '水'
    secondaryElement: String,
    yinYang: String         // '陰', '陽'
  },
  sajuProfile: {
    fourPillars: {
      yearPillar: {
        stem: String,       // '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
        branch: String,     // '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
        fullStemBranch: String,
        fortune: String,
        spiritKiller: String,
        hiddenStems: [String],
        branchTenGod: String,
        hiddenStemsTenGods: [{
          stem: String,
          tenGod: String
        }]
      },
      monthPillar: { /* 同上 */ },
      dayPillar: { /* 同上 */ },
      hourPillar: { /* 同上 */ }
    },
    mainElement: String,
    yinYang: String,
    tenGods: {
      year: String,
      month: String,
      day: String,
      hour: String
    },
    secondaryElement: String,
    twelveFortunes: { /* 十二運星 */ },
    hiddenStems: { /* 各柱の通変 */ },
    twelveSpiritKillers: { /* 十二神殺 */ },
    dayMaster: String
  },
  teamIds: [ObjectId],
  // その他のフィールド...
}
```

### 問題点
1. **二重管理**: `elementalType`と`sajuProfile.mainElement`が重複している
2. **命名の混乱**: 五行属性を表す`elementalType`と四柱情報`sajuProfile`の区別が曖昧
3. **tenGods情報の構造**: 十神情報の表現が場所によって異なる（年月日時柱の十神と、地支の十神）

## Fortune モデル（fortunes コレクション）

### 現状構造
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: String,           // YYYY-MM-DD形式
  dailyElement: String,   // 日の五行
  yinYang: String,        // 日の陰陽
  overallLuck: Number,    // 総合運0-100
  careerLuck: Number,     // 仕事運0-100
  relationshipLuck: Number, // 人間関係運0-100
  creativeEnergyLuck: Number, // 創造力運0-100
  healthLuck: Number,     // 健康運0-100
  wealthLuck: Number,     // 金運0-100
  description: String,    // 運勢の説明文
  advice: String,         // アドバイス
  luckyColors: [String],  // ラッキーカラー
  luckyDirections: [String], // ラッキー方位
  compatibleElements: [String], // 相性の良い五行
  incompatibleElements: [String], // 相性の悪い五行
  viewedAt: Date,         // 閲覧日時
  // aiGeneratedAdvice: {}  // AI生成アドバイス（一部のレコードのみ）
}
```

### 問題点
1. **sajuDataの欠如**: 四柱推命情報との連携情報が不完全
2. **aiGeneratedAdvice構造の不整合**: 一部のレコードにのみ存在し、構造も一定でない
3. **日付管理**: `date`をString型としているため、日付範囲検索が非効率
4. **yinYang値の表現揺れ**: Boolean値と文字列('陰'/'陽')の混在

## DailyCalendarInfo モデル（dailycalendarinfos コレクション）

### 現状構造
```javascript
{
  _id: ObjectId,
  date: String,
  lunarDate: {
    year: Number,
    month: Number,
    day: Number
  },
  stemBranch: {
    dayStem: String,    // '甲', '乙', etc.
    dayBranch: String,  // '子', '丑', etc.
    monthStem: String,
    monthBranch: String,
    yearStem: String,
    yearBranch: String
  },
  solarTerms: {
    previous: {
      name: String,
      date: Date
    },
    next: {
      name: String,
      date: Date
    },
    current: {
      name: String,
      date: Date
    }
  }
}
```

### 問題点
1. **データ欠損**: 今日の日付のデータが作成されていない
2. **Fortune生成との連携不足**: このデータが運勢生成に活用されていない
3. **構造の不足**: 五行情報や陰陽情報が含まれていない

## Conversation モデル（conversations コレクション）

### 現状構造
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  messages: [{
    id: String,
    sender: String,      // 'user' | 'ai' | 'system'
    content: String,
    timestamp: String,
    isPromptQuestion: Boolean,
    _id: ObjectId
  }],
  context: {
    fortuneId: ObjectId,
    teamRelated: Boolean,
    sentimentScore: Number
  },
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 問題点
1. **コンテキスト情報の不足**: 四柱推命情報や運勢情報との連携が弱い
2. **sentimentScoreの活用不足**: 感情分析スコアが実質的に利用されていない
3. **メッセージ構造の冗長性**: 各メッセージにIDが二重に振られている（id と _id）

## Team モデル（teams コレクション）

### 現状構造
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  ownerId: ObjectId,
  members: [{
    userId: ObjectId,
    role: String,
    joinedAt: Date
  }],
  goal: String,
  elementalBalance: {
    wood: Number,
    fire: Number,
    earth: Number,
    metal: Number,
    water: Number
  },
  yinYangRatio: {
    yin: Number,
    yang: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 問題点
1. **メンバー五行情報の冗長性**: チームメンバーの五行情報がUserモデルと重複管理されている可能性
2. **リアルタイム性の欠如**: elementalBalance, yinYangRatioがメンバー変更時に更新されない可能性

## 相互関連図

```
User --+--> Fortune (userId)
       |
       +--> Conversation (userId)
       |
       +--> Team (ownerId, members.userId)
       |
       +--> Subscription (userId)

Fortune ---> DailyCalendarInfo (date)
         |
         +--> Conversation (context.fortuneId)
```

## データモデル上の主要な問題点

1. **構造設計の不一致**
   - 四柱推命情報（特に十神情報）の表現が複数の場所で異なっている
   - 五行属性の表現が統一されていない（elementalType vs mainElement）

2. **参照整合性の弱さ**
   - FortuneモデルからUser.sajuProfileへの明示的な依存関係がない
   - ConversationモデルのコンテキストとFortune/Team間の参照が不十分

3. **データの欠落**
   - 新しいデータモデル要素（branchTenGods）がフォーチュン生成に反映されていない
   - DailyCalendarInfoが適切に生成・活用されていない

4. **冗長なデータ管理**
   - 複数のモデルで同じ情報が異なる形式で保持されている
   - イベントドリブンな更新メカニズムの欠如で整合性維持が困難

## 改善提案

1. **データモデルの標準化**
   - サジュプロファイル構造の標準化と一貫した命名規則の採用
   - 十神情報と地支十神情報の統一的な表現方法の確立

2. **参照整合性の強化**
   - FortuneモデルにsajuDataの全体参照を追加
   - DailyCalendarInfoとの明示的な連携強化

3. **データ転送オブジェクト（DTO）の導入**
   - API間でデータ構造を変換する際のDTOパターン導入
   - フロントエンド・バックエンド間の型安全性確保

4. **リアルタイム更新メカニズムの実装**
   - イベントドリブンな更新処理で、関連モデル間の一貫性を維持
   - 連動更新がトリガーされるデザインパターンの採用

## 実装優先順位

1. **User.sajuProfileの構造統一と標準化**
   - 優先度: 高
   - 影響範囲: サジュ計算、運勢生成、AI対話

2. **Fortune-DailyCalendarInfo連携の強化**
   - 優先度: 中
   - 影響範囲: 運勢生成品質、日次処理

3. **会話コンテキスト改善**
   - 優先度: 中
   - 影響範囲: AI対話品質

4. **チームモデル最適化**
   - 優先度: 低
   - 影響範囲: チーム相性機能

## まとめ

データモデル分析の結果、パトロールマネジメントアプリケーションのモデル設計には、四柱推命情報の表現方法に関する不整合、参照整合性の弱さ、データ欠落などの問題が明らかになりました。特に重要な改善点は、sajuProfile構造の統一と標準化、Fortune-DailyCalendarInfo連携の強化、リアルタイムな参照整合性維持の仕組み実装です。これらの改善により、アプリケーション全体の一貫性と機能品質が向上し、メンテナンス性も高まることが期待されます。