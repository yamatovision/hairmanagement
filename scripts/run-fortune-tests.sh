#!/bin/bash

# デイリーフォーチュンAPIのテストを実行するスクリプト

# 色の定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===============================================${NC}"
echo -e "${YELLOW}     デイリーフォーチュンAPI テスト実行      ${NC}"
echo -e "${YELLOW}===============================================${NC}"

# 現在の日時を取得
CURRENT_DATE=$(date "+%Y-%m-%d %H:%M:%S")
echo -e "実行日時: ${CURRENT_DATE}\n"

# 環境変数設定
export API_URL="http://0.0.0.0:5001"

# バックエンドサーバーが起動しているか確認
echo -e "バックエンドサーバーへの接続確認中..."
curl -s "$API_URL/health" > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}エラー: バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。${NC}"
  echo -e "ヒント: 別のターミナルで 'cd backend && npm run dev' を実行してサーバーを起動してください。"
  exit 1
fi
echo -e "${GREEN}バックエンドサーバーに接続できました。${NC}\n"

# トークンがあれば使用（テストユーザーログイン）
echo -e "管理者ユーザーでログイン中..."
# Node.jsスクリプトでログイン
LOGIN_RESULT=$(node -e "
const axios = require('axios');
async function login() {
  try {
    const response = await axios.post('$API_URL/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(response.data.token || '');
  } catch (error) {
    console.error('');
  }
}
login();
")

# トークンの確認
if [ -z "$LOGIN_RESULT" ]; then
  echo -e "${YELLOW}警告: 管理者ユーザーでのログインに失敗しました。一部のテストが失敗する可能性があります。${NC}\n"
  export API_TOKEN=""
else
  export API_TOKEN="$LOGIN_RESULT"
  echo -e "${GREEN}管理者ユーザーでログイン成功しました。トークンを使用してテストを実行します。${NC}\n"
fi

# Node.jsスクリプトの実行
echo -e "デイリーフォーチュンAPIテストを実行中..."
node scripts/test-daily-fortune-api.js

# 実行結果のチェック
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}テスト実行が完了しました。結果ファイルを確認してください。${NC}"
else
  echo -e "\n${RED}テスト実行中にエラーが発生しました。${NC}"
fi

# 結果ファイルの確認
if [ -f "./test-results-fortune.json" ]; then
  echo -e "テスト結果ファイルが作成されました: ./test-results-fortune.json"
  
  # 失敗したテストの数を取得
  FAILED_COUNT=$(grep -o '"failed": [0-9]*' ./test-results-fortune.json | awk '{print $2}')
  
  if [ "$FAILED_COUNT" = "0" ]; then
    echo -e "\n${GREEN}すべてのテストが成功しました！${NC}"
  else
    echo -e "\n${YELLOW}$FAILED_COUNT 件のテストが失敗しました。詳細は結果ファイルを確認してください。${NC}"
  fi
else
  echo -e "${RED}テスト結果ファイルが見つかりません。テスト実行に問題がある可能性があります。${NC}"
fi