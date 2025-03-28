FROM node:18-slim

WORKDIR /app

# パッケージのインストール
COPY package*.json ./
RUN npm install

# アプリケーションコードのコピー
COPY . .

# 環境変数の設定
ENV PORT=8080
ENV NODE_ENV=production
ENV CORS_ORIGIN="https://dailyfortune-app.web.app"

# ポートの公開
EXPOSE 8080

# アプリケーションの起動
CMD ["node", "index.js"]