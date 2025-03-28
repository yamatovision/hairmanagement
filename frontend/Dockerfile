FROM node:16-alpine

WORKDIR /app

# パッケージファイルをコピーして依存関係をインストール
COPY package.json package-lock.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# アプリケーションを起動
EXPOSE 3000
CMD ["npm", "start"]