#!/bin/bash

# 経営者ダッシュボード関連エンドポイントの実データテストを実行するスクリプト

# 色のエスケープシーケンス
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 現在のディレクトリを取得
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$(dirname "$DIR")"

# MongoDB起動確認
check_mongodb() {
  echo -e "${BLUE}MongoDB の状態を確認中...${NC}"
  
  # mongodがインストールされているか確認
  if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}MongoDB がインストールされていません。${NC}"
    echo -e "${YELLOW}MongoDB をインストールしてから再度実行してください。${NC}"
    return 1
  fi
  
  # MongoDB が起動しているか確認
  if ! pgrep -x mongod > /dev/null; then
    echo -e "${YELLOW}MongoDB が起動していません。起動を試みます...${NC}"
    
    # MongoDB データディレクトリが存在するか確認
    MONGO_DATA_DIR="/tmp/mongodb"
    if [ ! -d "$MONGO_DATA_DIR" ]; then
      mkdir -p "$MONGO_DATA_DIR"
    fi
    
    # バックグラウンドで MongoDB を起動
    mongod --dbpath "$MONGO_DATA_DIR" &
    
    # MongoDB の起動を待機
    echo "MongoDB の起動を待機しています..."
    sleep 5
    
    # 再度確認
    if ! pgrep -x mongod > /dev/null; then
      echo -e "${RED}MongoDB の起動に失敗しました。${NC}"
      echo -e "${RED}手動で MongoDB を起動してから再度試してください。${NC}"
      return 1
    fi
    
    echo -e "${GREEN}MongoDB を起動しました。${NC}"
  else
    echo -e "${GREEN}MongoDB は既に起動しています。${NC}"
  fi
  
  return 0
}

# バックエンドサーバーの起動確認
check_backend_server() {
  echo -e "${BLUE}バックエンドサーバーの状態を確認中...${NC}"
  
  # サーバーが応答するか確認
  if curl -s http://localhost:5000/api/v1 > /dev/null; then
    echo -e "${GREEN}バックエンドサーバーは既に起動しています。${NC}"
    return 0
  else
    echo -e "${YELLOW}バックエンドサーバーが起動していません。起動を試みます...${NC}"
    
    # バックエンドディレクトリが存在するか確認
    BACKEND_DIR="$REPO_ROOT/backend"
    if [ ! -d "$BACKEND_DIR" ]; then
      echo -e "${RED}バックエンドディレクトリが見つかりません: $BACKEND_DIR${NC}"
      return 1
    fi
    
    # 新しいターミナルウィンドウでバックエンドを起動
    osascript -e 'tell app "Terminal" to do script "cd \"'"$BACKEND_DIR"'\" && npm run dev"'
    
    echo -e "${CYAN}バックエンドサーバーの起動を開始しました。${NC}"
    echo "サーバーの起動を待機しています..."
    
    # サーバーが応答するのを最大30秒待機
    MAX_RETRIES=10
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
      if curl -s http://localhost:5000/api/v1 > /dev/null; then
        echo -e "${GREEN}バックエンドサーバーが応答しています。${NC}"
        return 0
      fi
      
      RETRY_COUNT=$((RETRY_COUNT + 1))
      sleep 3
      echo "待機中... ($RETRY_COUNT/$MAX_RETRIES)"
    done
    
    echo -e "${YELLOW}バックエンドサーバーからの応答を待機中にタイムアウトしました。${NC}"
    echo -e "${YELLOW}サーバーが起動しているか手動で確認し、必要に応じて再試行してください。${NC}"
    return 1
  fi
}

# npm パッケージのインストール確認
check_npm_packages() {
  echo -e "${BLUE}必要な npm パッケージを確認中...${NC}"
  
  cd "$REPO_ROOT"
  
  # package.json に必要なパッケージがあるか確認
  if ! grep -q '"mongoose"' package.json; then
    echo -e "${YELLOW}mongoose パッケージがインストールされていません。インストールします...${NC}"
    npm install mongoose
  fi
  
  if ! grep -q '"axios"' package.json; then
    echo -e "${YELLOW}axios パッケージがインストールされていません。インストールします...${NC}"
    npm install axios
  fi
  
  if ! grep -q '"dotenv"' package.json; then
    echo -e "${YELLOW}dotenv パッケージがインストールされていません。インストールします...${NC}"
    npm install dotenv
  fi
  
  if ! grep -q '"uuid"' package.json; then
    echo -e "${YELLOW}uuid パッケージがインストールされていません。インストールします...${NC}"
    npm install uuid
  fi
  
  echo -e "${GREEN}必要なパッケージのインストールを確認しました。${NC}"
}

# テストデータの投入
seed_test_data() {
  echo -e "${BLUE}テストデータを MongoDB に投入中...${NC}"
  
  cd "$REPO_ROOT"
  
  # テストデータ投入スクリプトを実行
  node scripts/seed-analytics-data.js
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}テストデータの投入が完了しました。${NC}"
    return 0
  else
    echo -e "${RED}テストデータの投入中にエラーが発生しました。${NC}"
    return 1
  fi
}

# エンドポイントのテスト実行
run_endpoint_tests() {
  echo -e "${BLUE}エンドポイントテストを実行中...${NC}"
  
  cd "$REPO_ROOT"
  
  # エンドポイントテストスクリプトを実行
  node scripts/test-live-analytics-endpoints.js
  
  # テスト結果を保存
  TEST_RESULT=$?
  
  if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}すべてのテストが成功しました！${NC}"
  else
    echo -e "${RED}一部のテストが失敗しました。詳細については上記のログを確認してください。${NC}"
  fi
  
  return $TEST_RESULT
}

# メイン処理
main() {
  echo -e "${BLUE}===== 経営者ダッシュボード関連エンドポイントの実データテスト開始 =====${NC}"
  
  # MongoDB の確認
  check_mongodb
  if [ $? -ne 0 ]; then
    echo -e "${RED}MongoDB の準備ができていないため、テストを中止します。${NC}"
    exit 1
  fi
  
  # npm パッケージの確認
  check_npm_packages
  
  # テストデータの投入
  seed_test_data
  if [ $? -ne 0 ]; then
    echo -e "${RED}テストデータの投入に失敗したため、テストを中止します。${NC}"
    exit 1
  fi
  
  # バックエンドサーバーの確認
  check_backend_server
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}警告: バックエンドサーバーの準備ができていない可能性があります。${NC}"
    read -p "テストを続行しますか？ (y/n): " CONTINUE_TEST
    if [[ $CONTINUE_TEST != "y" && $CONTINUE_TEST != "Y" ]]; then
      echo -e "${RED}テストを中止します。${NC}"
      exit 1
    fi
  fi
  
  # エンドポイントのテスト実行
  run_endpoint_tests
  
  # 終了コードを返す
  exit $?
}

# スクリプト実行
main