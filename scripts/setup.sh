#!/bin/bash

# パトロール管理システム セットアップスクリプト
# 使用方法: ./scripts/setup.sh

set -e

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}パトロール管理システム セットアップを開始します${NC}"

# 必要なディレクトリの作成
echo -e "${GREEN}必要なディレクトリを作成しています...${NC}"
mkdir -p logs
mkdir -p backend/src
mkdir -p frontend/src
mkdir -p frontend/public

# .envファイルのコピー
echo -e "${GREEN}環境変数ファイルを準備しています...${NC}"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}.env.exampleを.envにコピーしました${NC}"
    echo -e "${YELLOW}注意: .envファイルを編集して正しい値を設定してください${NC}"
  else
    echo -e "${RED}.env.exampleファイルが見つかりません${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}.envファイルはすでに存在します${NC}"
fi

# package.jsonの作成
echo -e "${GREEN}package.jsonを作成しています...${NC}"
if [ ! -f package.json ]; then
  cat > package.json << 'EOF'
{
  "name": "patrolmanagement",
  "version": "0.1.0",
  "description": "美容師向け陰陽五行AIケアコンパニオン",
  "main": "index.js",
  "scripts": {
    "start": "docker-compose up",
    "start:dev": "docker-compose --profile dev up",
    "stop": "docker-compose down",
    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install",
    "build": "cd backend && npm run build && cd ../frontend && npm run build",
    "test": "cd backend && npm test && cd ../frontend && npm test"
  },
  "keywords": [
    "patrolmanagement",
    "five-elements",
    "ai",
    "beauty",
    "care"
  ],
  "author": "",
  "license": "MIT"
}
EOF
  echo -e "${GREEN}package.jsonを作成しました${NC}"
else
  echo -e "${GREEN}package.jsonはすでに存在します${NC}"
fi

# バックエンドpackage.jsonの作成
echo -e "${GREEN}バックエンドのpackage.jsonを作成しています...${NC}"
if [ ! -f backend/package.json ]; then
  cat > backend/package.json << 'EOF'
{
  "name": "patrolmanagement-backend",
  "version": "0.1.0",
  "description": "パトロール管理システム バックエンド",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.2.0",
    "morgan": "^1.10.0",
    "openai": "^3.2.1",
    "winston": "^3.8.2"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0",
    "@types/cors": "^2.8.13",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.1",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/morgan": "^1.9.4",
    "@types/node": "^20.2.5",
    "@types/supertest": "^2.0.12",
    "@typescript-eslint/eslint-plugin": "^5.59.7",
    "@typescript-eslint/parser": "^5.59.7",
    "eslint": "^8.41.0",
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "prettier": "^2.8.8",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.4"
  }
}
EOF
  echo -e "${GREEN}バックエンドのpackage.jsonを作成しました${NC}"
else
  echo -e "${GREEN}バックエンドのpackage.jsonはすでに存在します${NC}"
fi

# フロントエンドpackage.jsonの作成
echo -e "${GREEN}フロントエンドのpackage.jsonを作成しています...${NC}"
if [ ! -f frontend/package.json ]; then
  cat > frontend/package.json << 'EOF'
{
  "name": "patrolmanagement-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.11.16",
    "@mui/material": "^5.13.2",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.4.3",
    "axios": "^1.4.0",
    "date-fns": "^2.30.0",
    "firebase": "^9.22.1",
    "formik": "^2.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-query": "^3.39.3",
    "react-router-dom": "^6.11.2",
    "react-scripts": "5.0.1",
    "web-vitals": "^3.3.1",
    "yup": "^1.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/**/*.{js,jsx,ts,tsx}",
    "format": "prettier --write src/**/*.{js,jsx,ts,tsx,css,scss}"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@types/jest": "^29.5.1",
    "@types/node": "^20.2.5",
    "@types/react": "^18.2.7",
    "@types/react-dom": "^18.2.4",
    "@types/react-router-dom": "^5.3.3",
    "@typescript-eslint/eslint-plugin": "^5.59.7",
    "@typescript-eslint/parser": "^5.59.7",
    "eslint": "^8.41.0",
    "eslint-plugin-react": "^7.32.2",
    "prettier": "^2.8.8",
    "typescript": "^5.0.4"
  }
}
EOF
  echo -e "${GREEN}フロントエンドのpackage.jsonを作成しました${NC}"
else
  echo -e "${GREEN}フロントエンドのpackage.jsonはすでに存在します${NC}"
fi

# バックエンドのTSConfig
echo -e "${GREEN}バックエンドのtsconfig.jsonを作成しています...${NC}"
if [ ! -f backend/tsconfig.json ]; then
  cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
EOF
  echo -e "${GREEN}バックエンドのtsconfig.jsonを作成しました${NC}"
else
  echo -e "${GREEN}バックエンドのtsconfig.jsonはすでに存在します${NC}"
fi

# フロントエンドのTSConfig
echo -e "${GREEN}フロントエンドのtsconfig.jsonを作成しています...${NC}"
if [ ! -f frontend/tsconfig.json ]; then
  cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
EOF
  echo -e "${GREEN}フロントエンドのtsconfig.jsonを作成しました${NC}"
else
  echo -e "${GREEN}フロントエンドのtsconfig.jsonはすでに存在します${NC}"
fi

# フロントエンドの基本ファイル
echo -e "${GREEN}フロントエンドの基本ファイルを作成しています...${NC}"
mkdir -p frontend/public

if [ ! -f frontend/public/index.html ]; then
  cat > frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="美容師向け陰陽五行AIケアコンパニオン"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>美容師向け陰陽五行AIケアコンパニオン</title>
  </head>
  <body>
    <noscript>このアプリケーションを実行するにはJavaScriptを有効にしてください。</noscript>
    <div id="root"></div>
  </body>
</html>
EOF
  echo -e "${GREEN}frontend/public/index.htmlを作成しました${NC}"
else
  echo -e "${GREEN}frontend/public/index.htmlはすでに存在します${NC}"
fi

# セットアップ完了メッセージ
echo -e "${GREEN}セットアップが完了しました！${NC}"
echo -e "${YELLOW}次のステップ:${NC}"
echo -e "1. ${YELLOW}.envファイルを編集して必要な環境変数を設定してください${NC}"
echo -e "2. ${YELLOW}npm run install:all${NC} を実行して依存関係をインストールしてください"
echo -e "3. ${YELLOW}npm run start:dev${NC} を実行して開発環境を起動してください"

exit 0