/**
 * Claude API接続テストスクリプト
 * 
 * このスクリプトはClaudeのAPIに対して直接リクエストを行い、
 * 接続とレスポンスが正常に機能しているかを確認します。
 */

// 必要なパッケージをインポート
const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');
const path = require('path');

// .envファイルをロード（プロジェクトルートからの相対パス）
dotenv.config({ path: path.resolve(__dirname, './.env') });

// APIキーと設定を取得
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
console.log('ロードされたAPIキー:', CLAUDE_API_KEY ? `${CLAUDE_API_KEY.substring(0, 10)}...` : 'なし');
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307';

// APIキーの存在チェック
if (!CLAUDE_API_KEY) {
  console.error('エラー: CLAUDE_API_KEY環境変数が設定されていません。');
  process.exit(1);
}

// Anthropicクライアントの初期化
const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

/**
 * Claude APIテスト関数
 */
async function testClaudeAPI() {
  console.log('Claude API接続テストを開始します...');
  console.log(`使用モデル: ${CLAUDE_MODEL}`);
  
  try {
    console.log('APIリクエスト送信中...');
    
    // シンプルなプロンプトでAPIリクエスト
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      system: "あなたは陰陽五行の原理に基づいたキャリアアドバイザーです。",
      messages: [
        {
          role: "user",
          content: "美容師としてのキャリアで大切にすべきことは何ですか？簡潔に教えてください。"
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });
    
    // レスポンスの表示
    console.log('\n--- APIレスポンス ---');
    console.log('ステータス: 成功');
    console.log(`モデル: ${response.model}`);
    console.log(`応答内容: ${response.content[0].text}`);
    console.log('--- レスポンス終了 ---\n');
    
    console.log('Claude API接続テストは正常に完了しました。');
    return true;
  } catch (error) {
    console.error('\n--- APIエラー ---');
    console.error(`ステータス: ${error.status || 'Unknown'}`);
    console.error(`エラーメッセージ: ${error.message}`);
    
    // エラータイプに基づいたより詳細な情報
    if (error.status === 401) {
      console.error('認証エラー: APIキーが無効か期限切れです。');
    } else if (error.status === 429) {
      console.error('レート制限エラー: APIリクエスト数が多すぎます。');
    } else if (error.status === 400) {
      console.error('リクエストエラー: パラメータが不正です。');
      if (error.response && error.response.data) {
        console.error('詳細:', JSON.stringify(error.response.data, null, 2));
      }
    }
    console.error('--- エラー終了 ---\n');
    
    console.error('Claude API接続テストは失敗しました。');
    return false;
  }
}

// テストの実行
testClaudeAPI()
  .then(success => {
    if (success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('予期せぬエラーが発生しました:', err);
    process.exit(1);
  });