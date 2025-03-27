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

# MongoDB からテストデータをクリア
clear_test_data() {
  echo -e "${BLUE}MongoDB からテストデータをクリア中...${NC}"
  
  mongo patrolmanagement --quiet --eval "db.engagementanalytics.drop(); db.teamanalytics.drop(); print('テストデータをクリアしました');" || echo -e "${YELLOW}MongoDB データのクリアに失敗しました。無視して続行します。${NC}"
}

# テストデータの投入
seed_test_data() {
  echo -e "${BLUE}テストデータを MongoDB に投入中...${NC}"
  
  cd "$REPO_ROOT"
  
  # テストデータ投入スクリプトを実行
  node scripts/seed-test-data.cjs
  
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
  node scripts/test-endpoints.cjs
  
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
  
  # テストデータをクリア
  clear_test_data
  
  # テストデータの投入
  seed_test_data
  if [ $? -ne 0 ]; then
    echo -e "${RED}テストデータの投入に失敗したため、テストを中止します。${NC}"
    exit 1
  fi
  
  # エンドポイントのテスト実行
  run_endpoint_tests
  
  # 終了コードを返す
  exit $?
}

# スクリプト実行
main