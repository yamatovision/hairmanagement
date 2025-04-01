# 最適化されたDockerfile
FROM node:18-slim as build

WORKDIR /app

# 依存関係のインストール（キャッシュ効率化）
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# ソースコードのコピーとビルド
COPY ./src ./src
RUN npm run build

# 本番ステージ（軽量化）
FROM node:18-slim

WORKDIR /app

# 依存関係のインストール (本番環境用のみ)
COPY package*.json ./
RUN npm ci --only=production

# ビルド結果のコピー
COPY --from=build /app/dist ./dist

# 環境変数
ENV NODE_ENV=production 
ENV PORT=8080
ENV SKIP_DB=true
ENV SKIP_DB_ERRORS=true
ENV NODE_OPTIONS="--unhandled-rejections=strict --trace-warnings"

# ポート公開
EXPOSE 8080

# 明示的にディレクトリ構造を確認
RUN ls -la /app && ls -la /app/dist

# バックエンドサーバー起動
CMD ["node", "dist/index.js"]