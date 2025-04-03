# 会話機能要件定義書

## 1. 概要

本書は陰陽五行に基づくパトロールマネジメントアプリケーションにおける会話機能の要件を定義します。会話機能は「デイリー運勢」「チーム」「メンバー」の3つのコンテキストで相談できる対話システムを提供します。

## 2. 基本設計方針

### 2.1 シンプルさの追求
- 単一の統一されたAPIエンドポイントを使用
- 履歴機能やサマリー機能は実装しない
- 保存が必要な場合のみダウンロード機能を提供

### 2.2 有効期限の設定
- 各会話はタイプごとに1つのみ作成
- 日付が変わると自動的に削除される
- MongoDBのTTLインデックスを利用して自動期限切れを実装

### 2.3 統一されたインターフェース
- 全ての相談タイプで同一のAPIフォーマットを使用
- 会話の開始から終了まで一貫した操作感を提供

## 3. データモデル

```typescript
{
  _id: ObjectId,              // 会話ID
  userId: ObjectId,           // ユーザーID
  type: String,               // "fortune", "team", "member"のいずれか
  contextId: ObjectId,        // 関連する項目のID（運勢ID、チームID、メンバーID）
  messages: [                 // メッセージ配列
    {
      role: String,           // "system", "user", "assistant"
      content: String,        // メッセージ内容
      timestamp: Date,        // 送信日時
      metadata: Object        // 任意のメタデータ（オプション）
    }
  ],
  createdAt: Date,            // 作成日時
  expiresAt: Date             // 有効期限（翌日の0時）
}
```

## 4. APIエンドポイント

### 4.1 会話開始/継続 API

**エンドポイント**: `POST /api/v1/conversations`

**リクエスト**:
```json
{
  "type": "fortune|team|member",
  "contextId": "関連する項目のID"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "会話ID",
    "type": "会話タイプ",
    "messages": [/* メッセージ配列 */],
    "createdAt": "作成日時"
  }
}
```

### 4.2 メッセージ送信 API

**エンドポイント**: `POST /api/v1/conversations/:id/messages`

**リクエスト**:
```json
{
  "content": "ユーザーメッセージ"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "message": {
      "role": "assistant",
      "content": "AIの応答",
      "timestamp": "送信日時"
    }
  }
}
```

## 5. 会話タイプ別の初期化ロジック

### 5.1 デイリー運勢相談

```typescript
// 初期メッセージの例
const fortuneInitialMessage = {
  role: "system",
  content: "デイリー運勢に基づく相談を受け付けます。本日の運勢は「${fortune.rating}」で、「${fortune.mainElement}」の「${fortune.yinYang}」が特徴です。",
  metadata: {
    fortuneData: {
      date: fortune.date,
      rating: fortune.rating,
      mainElement: fortune.mainElement,
      yinYang: fortune.yinYang,
      advice: fortune.advice
    }
  }
};
```

### 5.2 チーム相談

```typescript
// 初期メッセージの例
const teamInitialMessage = {
  role: "system",
  content: "チーム「${team.name}」に関する相談を受け付けます。このチームは${team.memberCount}名のメンバーがおり、主な活動は「${team.mainActivity}」です。",
  metadata: {
    teamData: {
      name: team.name,
      memberCount: team.members.length,
      mainActivity: team.mainActivity,
      teamElements: team.elementalProfile
    }
  }
};
```

### 5.3 メンバー相談

```typescript
// 初期メッセージの例
const memberInitialMessage = {
  role: "system",
  content: "メンバー「${member.name}」さんとの相性に関する相談を受け付けます。このメンバーは「${member.mainElement}」の「${member.yinYang}」が特徴で、あなたとの相性度は${compatibility}%です。",
  metadata: {
    memberData: {
      name: member.name,
      mainElement: member.elementalProfile.mainElement,
      yinYang: member.elementalProfile.yinYang,
      compatibility: calculateCompatibility(user, member)
    }
  }
};
```

## 6. 実装上の注意点

### 6.1 有効期限の設定
```javascript
// TTLインデックスの作成（MongoDBシェル）
db.conversations.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// 有効期限の設定（翌日の0時）
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);
```

### 6.2 エラーハンドリング
- 存在しないコンテキストIDを指定された場合は404を返す
- 無効な会話タイプを指定された場合は400を返す
- 会話IDが存在しない場合は404を返す

### 6.3 セキュリティ
- 会話へのアクセスは作成したユーザーのみに制限する
- トークンによる認証を必須とする
- 全てのAPIリクエストを認証ミドルウェアで保護する

## 7. UI要素

### 7.1 会話インターフェース
- シンプルなチャットUI
- メッセージの送信と表示機能
- 入力中インジケーター
- エラー表示

### 7.2 ダウンロード機能
- 現在の会話をJSONとしてダウンロードするボタン
- ダウンロードされたファイル名は「{type}-{date}.json」の形式

## 8. UXフロー

1. ユーザーがデイリー運勢、チーム、またはメンバープロフィールから「相談する」を選択
2. システムは指定されたコンテキストタイプとIDに基づいて会話を開始または継続
3. ユーザーは会話インターフェースでメッセージを送信
4. 会話は日付が変わるまで継続可能
5. 必要に応じて、ユーザーは会話をダウンロードして保存可能
6. 日付が変わると会話は自動的にリセット

## 9. 将来の拡張性

この設計は将来的に以下の機能を追加できるよう考慮されています：

- 新しい会話タイプの追加（プロジェクト相談、キャリア相談など）
- 会話の要約・分析機能（オプション）
- AI応答の多言語対応
- 音声入出力の統合

ただし、シンプルさを保つため、新機能の追加は慎重に検討し、必要な場合のみ実装してください。