#\!/bin/bash

# 環境変数を明示的に読み込んでからバックエンドを起動するスクリプト
cd backend

# .envファイルが存在する場合はそこから環境変数を読み込む
if [ -f .env ]; then
  echo Loading environment variables from .env file
  export NODE_ENV=development PORT=5000 DB_URI=mongodb://localhost:27017/hairmanagement JWT_SECRET=.env.example_jwt_secret_9300 CLAUDE_API_KEY=[REDACTED] API_VERSION=v1 API_PREFIX=/api CORS_ORIGIN=http://localhost:3000
else
  echo Warning: .env file not found
fi

# 重要な環境変数が設定されているか確認
if [ -z "$CLAUDE_API_KEY" ]; then
  echo Warning: CLAUDE_API_KEY is not set
fi

if [ -z "$MONGODB_URI" ]; then
  echo Warning: MONGODB_URI is not set
fi

# バックエンドを起動
echo Starting backend server with environment variables...
npm run dev


