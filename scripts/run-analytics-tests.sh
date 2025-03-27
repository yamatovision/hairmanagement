#!/bin/bash

# 経営者ダッシュボード関連のテストを実行するスクリプト

# 色のエスケープシーケンス
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 現在のディレクトリを取得
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$(dirname "$DIR")"

echo -e "${BLUE}===== 経営者ダッシュボード関連テスト実行 =====${NC}\n"

# バックエンドの起動チェック
echo -e "${BLUE}バックエンドサーバーのステータスを確認中...${NC}"
curl -s http://localhost:5000/api/v1 > /dev/null
BACKEND_RUNNING=$?

if [ $BACKEND_RUNNING -ne 0 ]; then
  echo -e "${YELLOW}警告: バックエンドサーバーが起動していないようです。${NC}"
  echo -e "${YELLOW}いくつかのテストは失敗する可能性があります。${NC}\n"
  
  # バックエンドスタートアップオプションを提供
  read -p "バックエンドを起動しますか？ (y/n): " START_BACKEND
  if [[ $START_BACKEND == "y" || $START_BACKEND == "Y" ]]; then
    echo -e "${BLUE}バックエンドを起動しています...${NC}"
    # 別のターミナルウィンドウでバックエンドを起動
    osascript -e 'tell app "Terminal" to do script "cd \"'"$REPO_ROOT"'\" && cd backend && npm run dev"'
    echo -e "${GREEN}バックエンドの起動を開始しました。${NC}"
    echo "5秒待機しています..."
    sleep 5
  fi
fi

# フロントエンドの起動チェック
echo -e "${BLUE}フロントエンドサーバーのステータスを確認中...${NC}"
curl -s http://localhost:3000 > /dev/null
FRONTEND_RUNNING=$?

if [ $FRONTEND_RUNNING -ne 0 ]; then
  echo -e "${YELLOW}警告: フロントエンドサーバーが起動していないようです。${NC}"
  echo -e "${YELLOW}フロントエンドのテストは実行できません。${NC}\n"
  
  # フロントエンドスタートアップオプションを提供
  read -p "フロントエンドを起動しますか？ (y/n): " START_FRONTEND
  if [[ $START_FRONTEND == "y" || $START_FRONTEND == "Y" ]]; then
    echo -e "${BLUE}フロントエンドを起動しています...${NC}"
    # 別のターミナルウィンドウでフロントエンドを起動
    osascript -e 'tell app "Terminal" to do script "cd \"'"$REPO_ROOT"'\" && cd frontend && npm start"'
    echo -e "${GREEN}フロントエンドの起動を開始しました。${NC}"
    echo "5秒待機しています..."
    sleep 5
  fi
fi

echo -e "${BLUE}依存パッケージの確認...${NC}"
# 必要なパッケージがインストールされているか確認
cd "$REPO_ROOT"

# package.jsonから必要なパッケージリストを取得してチェック
REQUIRED_PACKAGES=("axios" "chalk" "dotenv" "puppeteer" "jest" "supertest")

for pkg in "${REQUIRED_PACKAGES[@]}"; do
  if ! grep -q "\"$pkg\"" package.json; then
    echo -e "${YELLOW}警告: $pkgがインストールされていません。インストールします...${NC}"
    npm install --save-dev "$pkg"
  fi
done

echo -e "${GREEN}依存パッケージの確認が完了しました。${NC}\n"

# 1. APIエンドポイントテスト
echo -e "${BLUE}1. APIエンドポイントテスト実行中...${NC}"
node "$REPO_ROOT/scripts/test-analytics-endpoints.js"
ENDPOINT_TEST_STATUS=$?

if [ $ENDPOINT_TEST_STATUS -eq 0 ]; then
  echo -e "${GREEN}APIエンドポイントテスト成功${NC}\n"
else
  echo -e "${RED}APIエンドポイントテスト失敗${NC}\n"
fi

# 2. バックエンドのユニットテスト
echo -e "${BLUE}2. バックエンドユニットテスト実行中...${NC}"
cd "$REPO_ROOT/backend"
npx jest --config=jest.config.js src/tests/analytics.test.js
UNIT_TEST_STATUS=$?

if [ $UNIT_TEST_STATUS -eq 0 ]; then
  echo -e "${GREEN}バックエンドユニットテスト成功${NC}\n"
else
  echo -e "${RED}バックエンドユニットテスト失敗${NC}\n"
fi

# 3. フロントエンドのルーティングテスト
if [ $FRONTEND_RUNNING -eq 0 ]; then
  echo -e "${BLUE}3. フロントエンドルーティングテスト実行中...${NC}"
  cd "$REPO_ROOT"
  node "$REPO_ROOT/scripts/test-dashboard-routing.js"
  FRONTEND_TEST_STATUS=$?
  
  if [ $FRONTEND_TEST_STATUS -eq 0 ]; then
    echo -e "${GREEN}フロントエンドルーティングテスト成功${NC}\n"
  else
    echo -e "${RED}フロントエンドルーティングテスト失敗${NC}\n"
  fi
else
  echo -e "${YELLOW}フロントエンドサーバーが起動していないため、フロントエンドテストをスキップします。${NC}\n"
fi

# テスト結果のサマリー
echo -e "${BLUE}===== テスト結果サマリー =====${NC}"

if [ $ENDPOINT_TEST_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ APIエンドポイントテスト: 成功${NC}"
else
  echo -e "${RED}✗ APIエンドポイントテスト: 失敗${NC}"
fi

if [ $UNIT_TEST_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ バックエンドユニットテスト: 成功${NC}"
else
  echo -e "${RED}✗ バックエンドユニットテスト: 失敗${NC}"
fi

if [ $FRONTEND_RUNNING -eq 0 ]; then
  if [ $FRONTEND_TEST_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓ フロントエンドルーティングテスト: 成功${NC}"
  else
    echo -e "${RED}✗ フロントエンドルーティングテスト: 失敗${NC}"
  fi
else
  echo -e "${YELLOW}! フロントエンドルーティングテスト: スキップ${NC}"
fi

# 総合結果
if [ $ENDPOINT_TEST_STATUS -eq 0 ] && [ $UNIT_TEST_STATUS -eq 0 ] && ([ $FRONTEND_RUNNING -ne 0 ] || [ $FRONTEND_TEST_STATUS -eq 0 ]); then
  echo -e "\n${GREEN}すべてのテストが成功しました！${NC}"
  exit 0
else
  echo -e "\n${RED}一部のテストが失敗しました。上記のログを確認してください。${NC}"
  exit 1
fi