#!/bin/bash

# テスト実行スクリプト
# 
# フォーチュン機能のAPIエンドポイントテストを実行します
#
# 使用方法:
# $ ./tests/run-tests.sh
#
# 変更履歴:
# - 2025/03/26: 初期実装 (AppGenius)

# カラー定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# ディレクトリをプロジェクトルートに変更
cd "$(dirname "$0")/.."

echo -e "${YELLOW}=======================================================${NC}"
echo -e "${YELLOW}      フォーチュン機能 API テスト実行スクリプト${NC}"
echo -e "${YELLOW}=======================================================${NC}"
echo ""

# 必要なパッケージがインストールされているか確認
echo -e "${YELLOW}依存パッケージの確認...${NC}"
if ! npm list jest > /dev/null 2>&1; then
  echo -e "${RED}Jestパッケージが見つかりません。インストールします...${NC}"
  npm install --save-dev jest supertest @types/jest @types/supertest
fi

# テスト用の環境変数を設定
echo -e "${YELLOW}テスト環境の準備...${NC}"
export NODE_ENV=test
export JWT_SECRET=test-secret
export MONGODB_URI=mongodb://localhost:27017/fortune-test

# MongoDBが利用可能かチェック
echo -e "${YELLOW}MongoDBの接続チェック...${NC}"
if ! nc -z localhost 27017 > /dev/null 2>&1; then
  echo -e "${RED}MongoDBが起動していないようです。${NC}"
  echo -e "${RED}テストを実行するにはMongoDBを起動してください。${NC}"
  exit 1
fi

# テストの実行
echo -e "${YELLOW}TypeScriptコンパイル中...${NC}"
npx tsc --noEmit false --skipLibCheck --allowJs

# JSファイルでテストを実行
echo -e "${YELLOW}運勢機能のテストを実行中...${NC}"
npx jest --testMatch="**/dist/tests/fortune.test.js" --detectOpenHandles --forceExit

echo -e "${YELLOW}チーム機能のテストを実行中...${NC}"
npx jest --testMatch="**/dist/tests/team.test.js" --detectOpenHandles --forceExit

# テスト結果の確認
if [ $? -eq 0 ]; then
  echo -e "${GREEN}テストが正常に完了しました！${NC}"
else
  echo -e "${RED}テストに失敗しました。エラーを確認してください。${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}=======================================================${NC}"
echo -e "${GREEN}テスト実行完了${NC}"
echo -e "${YELLOW}=======================================================${NC}"