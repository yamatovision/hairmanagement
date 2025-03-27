# 陰陽五行AIケアコンパニオン

## システム概要

美容師向けの陰陽五行理論に基づいたAIケアコンパニオンアプリケーション。このアプリケーションは、美容師がAIを通じて陰陽五行理論に基づいたアドバイスを得られるほか、日々の運勢を確認したり、チーム内コミュニケーションを活性化するツールとして活用できます。

## セットアップ手順

### 前提条件

- Node.js (v18以上)
- MongoDB
- Git

### インストール

1. リポジトリをクローン
   ```
   git clone <repository-url>
   cd patrolmanagement
   ```

2. 依存関係のインストール
   ```
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. 環境変数の設定
   ```
   cp .env.example .env
   ```
   `.env`ファイルを編集して必要な設定を行います。

### データベースのセットアップ

1. MongoDBが起動していることを確認します。

2. 管理者ユーザーが存在するか確認します。
   ```
   npm run test:auth -- --skip-backend
   ```

   管理者ユーザーが存在しない場合は、作成スクリプトを実行します。
   ```
   cd backend && node scripts/create-admin-user.js
   ```

### 開発サーバーの起動

```
./start-dev.sh
```
または
```
npm start
```

これにより、フロントエンドサーバー（ポート3000）とバックエンドサーバー（ポート5000）が同時に起動します。

## 認証テスト

セットアップ後、認証システムが正常に動作しているかテストできます：

1. MongoDBとの接続のみをテスト
   ```
   npm run test:auth -- --skip-backend
   ```

2. バックエンドAPIも含めた完全なテスト
   ```
   npm run test:auth
   ```
   注意: このテストを実行する前に、バックエンドサーバーが起動していることを確認してください。

## ログイン

デフォルトの管理者アカウント：
- Email: kazutofukushima1202@gmail.com
- パスワード: aikakumei

## プロジェクト構造

- `backend/` - ExpressとMongoDBを使用したバックエンドAPI
- `frontend/` - Reactベースのフロントエンドアプリケーション
- `shared/` - バックエンドとフロントエンド間で共有されるコード
- `docs/` - プロジェクトドキュメント

## ドキュメント

詳細なドキュメントは`docs/`ディレクトリにあります：

- [要件定義](./docs/requirements.md)
- [開発状況](./docs/CURRENT_STATUS.md)
- [認証システム](./docs/auth-system.md)
- [環境変数](./docs/env.md)
- [デプロイ](./docs/deploy.md)

## ライセンス

Copyright © 2025 AppGenius