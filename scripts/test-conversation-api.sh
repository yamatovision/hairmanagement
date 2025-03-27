#!/bin/bash

# AI対話システムAPIのテストスクリプト
echo "===== AI対話システム APIテスト ====="

# 環境変数設定
export API_URL="http://localhost:5001"
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="password123"

# カレントディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 必要なパッケージがインストールされているか確認
cd "$PROJECT_ROOT/backend"
npm list axios > /dev/null 2>&1 || npm install axios
npm list uuid > /dev/null 2>&1 || npm install uuid
npm list dotenv > /dev/null 2>&1 || npm install dotenv

# テストの実行
echo "バックエンドAPIテストを実行中..."
node "$PROJECT_ROOT/backend/src/tests/conversation.test.js"

# 終了コード
exit_code=$?
if [ $exit_code -eq 0 ]; then
  echo "✅ すべてのテストが正常に完了しました"
else
  echo "❌ テスト中にエラーが発生しました"
fi

# フロントエンドのUIテスト（開発環境で動作確認するための説明）
echo ""
echo "フロントエンドUIテストを行う場合は、以下の手順で実施してください："
echo "1. フロントエンドサーバーを起動: cd $PROJECT_ROOT/frontend && npm start"
echo "2. ブラウザで http://localhost:3000/conversation にアクセス"
echo "3. 以下の機能を確認してください："
echo "   - 呼び水質問の表示と回答機能"
echo "   - メッセージの送信と受信"
echo "   - 会話履歴の表示"
echo "   - メッセージのお気に入り登録"
echo "   - 会話のアーカイブ機能"

exit $exit_code