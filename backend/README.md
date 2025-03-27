# 美容師向け陰陽五行AIケアコンパニオン バックエンド

## テスト実行方法

### 前提条件
- Node.js と npm がインストールされていること
- MongoDB が起動していること

### テスト実行

#### 全テストの実行
```bash
npm test
```

#### フォーチュン機能のテスト実行
```bash
npm run test:fortune
```

#### チーム機能のテスト実行
```bash
npm run test:team
```

#### 詳細なテストスクリプト実行
```bash
npm run test:all
```
または
```bash
./src/tests/run-tests.sh
```

## テスト概要

### フォーチュン機能のテスト
フォーチュン機能に関する以下のAPIエンドポイントをテストします：

- `GET /api/v1/fortune/daily` - 当日の運勢を取得
- `GET /api/v1/fortune/date/:date` - 指定日の運勢を取得
- `GET /api/v1/fortune/range` - 日付範囲の運勢を取得
- `GET /api/v1/fortune/weekly` - 週間運勢を取得
- `POST /api/v1/fortune/:fortuneId/viewed` - 運勢を閲覧済みとしてマーク
- `GET /api/v1/fortune/today-element` - 今日の五行属性と陰陽を取得
- `GET /api/v1/fortune/users/:userId/daily` - 管理者用：特定ユーザーの当日の運勢を取得
- `GET /api/v1/fortune/users/:userId/date/:date` - 管理者用：特定ユーザーの指定日の運勢を取得
- `GET /api/v1/fortune/team-compatibility` - チーム相性を取得

### チーム機能のテスト
チーム機能に関する以下のAPIエンドポイントをテストします：

- `GET /api/v1/team/contributions` - チーム貢献一覧を取得
- `POST /api/v1/team/contributions` - 新しいチーム貢献を追加
- `GET /api/v1/team/contributions/user/:userId` - ユーザーのチーム貢献一覧を取得
- `PUT /api/v1/team/contributions/:id` - チーム貢献を更新
- `DELETE /api/v1/team/contributions/:id` - チーム貢献を削除
- `GET /api/v1/team/mentorships` - メンターシップ一覧を取得
- `POST /api/v1/team/mentorships` - 新しいメンターシップを作成
- `GET /api/v1/team/mentorships/user/:userId` - ユーザーのメンターシップ一覧を取得
- `PUT /api/v1/team/mentorships/:id` - メンターシップを更新
- `POST /api/v1/team/mentorships/:id/sessions` - メンターシップにセッションを追加
- `GET /api/v1/team/compatibility` - チーム相性情報を取得

## テスト戦略

テストスイートでは以下の観点からテストを行っています：

1. **正常系テスト**：正しいリクエストで期待通りのレスポンスが返ってくることの確認
2. **異常系テスト**：不正なリクエストに対するエラーハンドリングの確認
3. **認可テスト**：認証とアクセス権限の確認
4. **データ整合性テスト**：データの作成・更新・削除の一連の流れの確認

## 開発者向け情報

テストを追加・修正する場合は、`src/tests` ディレクトリにある各テストファイルを編集してください。認証に関する共通処理は `src/tests/helpers/auth.helper.ts` に定義されています。