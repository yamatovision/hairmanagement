# パトロールマネジメント デプロイガイド

## 開発環境

### 開発サーバー起動オプション

開発中は、以下のいずれかの方法でサーバーを起動できます：

#### 1. 標準開発モード
```bash
cd backend
npm run dev
```
TypeScriptのエラーチェックを行いながら起動しますが、一部のエラーでサーバーがクラッシュする場合があります。

#### 2. 最小限サーバー
```bash
cd backend
npm run dev:minimal
```
JSファイルベースのシンプルなサーバーで、基本的なAPIエンドポイントのみ提供します。TypeScriptのビルドエラーとは無関係に動作します。

#### 3. 開発効率最大化モード (推奨)
```bash
cd backend
npm run dev:debug
```
セキュリティ考慮を排除し、開発効率を最大化した特別モードです：

- すべてのエラーが詳細に表示される（スタックトレース、オブジェクト内容など）
- サーバークラッシュが発生しても自動的に再起動する
- メインポート(5001)とバックグラウンドポート(5002)の両方で動作
- すべてのリクエスト/レスポンスが詳細にログに記録される
- CORSの制限が完全に排除される
- TypeScriptのコンパイルエラーでもサーバーは継続して実行される

**注意**: この開発効率最大化モードは開発環境でのみ使用し、本番環境では絶対に使用しないでください。

## テスト

```bash
cd backend
npm test                # 全テスト実行
npm run test:coverage   # カバレッジレポート付きでテスト実行
```

## ビルド

```bash
cd backend
npm run build           # TypeScriptをJavaScriptにコンパイル
npm run typecheck       # 型チェックのみ実行（ファイル生成なし）
```

## デプロイ

### Google Cloud Run

```bash
cd backend
./deploy-cloudrun.sh
```

### 本番環境変数設定

本番環境では以下の環境変数を設定する必要があります：

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-frontend-url.com
```

### 注意事項

1. デプロイ前に必ず `npm run typecheck` を実行して型エラーがないことを確認してください
2. 秘密鍵や API キーは直接コードにハードコーディングせず、環境変数または Secret Manager で管理してください
3. 本番環境では `dev:debug` モードを絶対に使用しないでください