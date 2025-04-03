/**
 * シンプルなClaudeAI会話スクリプト
 * 
 * このスクリプトはAPIキーを直接使用してClaudeAIと会話します。
 * サーバーに依存せず、独立して動作します。
 * 
 * 使い方:
 * node test/simple-claude-chat.js "あなたの質問をここに入力"
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;

// 設定
const API_KEY = process.env.CLAUDE_API_KEY;
const API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';

// 会話履歴を保存するファイル
const HISTORY_FILE = './claude-conversation-history.json';

/**
 * ClaudeAIに対してメッセージを送信し、応答を取得する
 */
async function sendMessageToClaude(message, conversationHistory = []) {
  if (!API_KEY) {
    console.error('エラー: CLAUDE_API_KEYが環境変数に設定されていません。');
    process.exit(1);
  }

  try {
    // APIリクエスト用のメッセージ履歴を準備
    const messages = [...conversationHistory];
    
    // 新しいユーザーメッセージを追加
    messages.push({ role: 'user', content: message });

    console.log(`ClaudeAI APIにリクエスト送信中...`);
    const startTime = Date.now();
    
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        max_tokens: 1000,
        messages: messages
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const endTime = Date.now();
    const responseTime = (endTime - startTime) / 1000;
    console.log(`✅ 応答受信! (応答時間: ${responseTime.toFixed(2)}秒)`);
    
    if (response.data && response.data.content && Array.isArray(response.data.content) && response.data.content.length > 0) {
      const aiResponse = response.data.content[0].text;
      
      // 会話履歴に追加
      messages.push({ role: 'assistant', content: aiResponse });
      
      return {
        response: aiResponse,
        history: messages,
        usage: response.data.usage
      };
    } else {
      throw new Error('予期しない形式のレスポンス');
    }
  } catch (error) {
    console.error('❌ エラー発生:', error.message);
    
    if (error.response) {
      console.error('ステータスコード:', error.response.status);
      console.error('レスポンスデータ:', error.response.data);
    }
    
    return {
      response: 'エラーが発生しました。後でもう一度お試しください。',
      history: conversationHistory
    };
  }
}

/**
 * 会話履歴を読み込む
 */
async function loadConversationHistory() {
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // ファイルが存在しない場合や読み込みエラーの場合は空の履歴を返す
    return [];
  }
}

/**
 * 会話履歴を保存する
 */
async function saveConversationHistory(history) {
  try {
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
    console.log('会話履歴を保存しました');
  } catch (error) {
    console.error('会話履歴の保存に失敗しました:', error.message);
  }
}

/**
 * メイン関数
 */
async function main() {
  // コマンドライン引数からメッセージを取得
  const userMessage = process.argv[2];
  
  if (!userMessage) {
    console.log('使い方: node test/simple-claude-chat.js "あなたの質問をここに入力"');
    process.exit(1);
  }
  
  console.log('=== シンプルClaudeAI会話 ===');
  console.log(`モデル: ${MODEL}`);
  console.log(`メッセージ: "${userMessage}"`);
  
  // 会話履歴を読み込む
  const conversationHistory = await loadConversationHistory();
  console.log(`会話履歴: ${conversationHistory.length}件のメッセージを読み込みました`);
  
  // 会話履歴の内容を表示
  if (conversationHistory.length > 0) {
    console.log('\n=== 会話履歴 ===');
    conversationHistory.forEach((msg, index) => {
      const role = msg.role === 'user' ? '👤 ユーザー' : '🤖 Claude';
      const content = msg.content.length > 50 ? msg.content.substring(0, 50) + '...' : msg.content;
      console.log(`${index + 1}. ${role}: ${content}`);
    });
    console.log('');
  }
  
  // メッセージを送信し、応答を取得する
  const result = await sendMessageToClaude(userMessage, conversationHistory);
  
  console.log('\n=== Claude AIからの応答 ===');
  console.log(result.response);
  
  if (result.usage) {
    console.log('\n=== 使用トークン ===');
    console.log(`入力トークン: ${result.usage.input_tokens}`);
    console.log(`出力トークン: ${result.usage.output_tokens}`);
    console.log(`合計トークン: ${result.usage.input_tokens + result.usage.output_tokens}`);
  }
  
  // 会話履歴を保存する
  await saveConversationHistory(result.history);
}

// スクリプト実行
main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});