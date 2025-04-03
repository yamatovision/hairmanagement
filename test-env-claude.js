/**
 * Claude APIの環境変数テスト用スクリプト
 * 環境変数が正しく設定されているか、APIキーが有効かを確認します
 */
require('dotenv').config({ path: './backend/.env' });

// 環境変数の表示（キーの一部はマスク）
console.log('=== 環境変数の確認 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
const apiKey = process.env.CLAUDE_API_KEY || 'not-set';
console.log('CLAUDE_API_KEY:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));
console.log('CLAUDE_API_URL:', process.env.CLAUDE_API_URL);
console.log('CLAUDE_MODEL:', process.env.CLAUDE_MODEL);

// axios のインポート
const axios = require('axios');

/**
 * 実際にClaudeAPIを呼び出すテスト関数
 */
async function testClaudeApi() {
  console.log('\n=== Claude API 接続テスト ===');
  
  try {
    // API呼び出しのパラメータを設定
    const apiUrl = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    const model = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey || apiKey === 'dummy-api-key') {
      console.error('エラー: 有効なAPI キーが設定されていません');
      return;
    }
    
    console.log('API URL:', apiUrl);
    console.log('使用モデル:', model);
    
    // シンプルなプロンプトでテスト
    const prompt = 'こんにちは、今日の天気を教えてください。簡潔に答えてください。';
    console.log('テストプロンプト:', prompt);
    
    // APIリクエストを送信
    console.log('APIリクエスト送信中...');
    const response = await axios.post(
      apiUrl,
      {
        model: model,
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );
    
    // レスポンスを確認
    console.log('APIレスポンス受信完了');
    if (response.data && response.data.content) {
      console.log('\n--- APIレスポンス ---');
      console.log('ステータスコード:', response.status);
      console.log('レスポンス本文:', response.data.content[0].text);
      console.log('--------------------\n');
      console.log('テスト結果: 成功 ✅ APIは正常に機能しています');
    } else {
      console.error('エラー: 予期しないレスポンス形式:', response.data);
      console.log('テスト結果: 失敗 ❌ レスポンス形式が不正です');
    }
  } catch (error) {
    console.error('エラー: API呼び出し中にエラーが発生しました');
    console.error('エラーメッセージ:', error.message);
    if (error.response) {
      console.error('レスポンスステータス:', error.response.status);
      console.error('レスポンス詳細:', error.response.data);
    }
    console.log('テスト結果: 失敗 ❌ APIへの接続に失敗しました');
  }
}

/**
 * モック関数のテスト
 */
async function testMockFunction() {
  console.log('\n=== モック関数のテスト ===');
  
  // ClaudeAIServiceのモック関数をシミュレート
  function mockClaudeResponse(prompt) {
    console.log('モック関数が呼び出されました。プロンプト長:', prompt.length);
    
    // 構造化されたモックレスポンスを直接返す
    const structuredMockResponse = {
      summary: "あなたは今日、清々しい風が吹き抜ける森のような運気です。新しいアイデアが自然と湧き上がり、周囲との調和も取れやすい一日となるでしょう。特に、チームでの創造的な活動が成功に結びつく暗示があります。思い切って新しい発想を形にすることで、大きな成果が期待できます。",
      personalAdvice: "AIプロダクトの開発において、今日は特に「ユーザー体験」に焦点を当てると良いでしょう。技術的な側面よりも、実際の使用感や直感的な操作性を重視することで、より価値の高い成果が得られます。木の柔軟性のように臨機応変な対応を。",
      teamAdvice: "バイアウト目標達成のためには、今日は特に情報の共有と透明性を高めることが重要です。メンバー間での正確な情報伝達が、予期せぬ障害を事前に回避するカギとなります。木が根を張るように、強固な信頼関係を築きましょう。",
      luckyPoints: {
        color: "緑",
        items: ["観葉植物", "木製のアクセサリー"],
        number: 3,
        action: "朝日を浴びながら深呼吸する"
      }
    };
    
    return structuredMockResponse;
  }
  
  // パースを行う関数をシミュレート
  function parseAIResponse(response) {
    console.log('パース関数が呼び出されました。レスポンスタイプ:', typeof response);
    
    // オブジェクトが直接渡された場合はそのまま使用
    if (typeof response === 'object' && response !== null) {
      console.log('オブジェクトが直接渡されました');
      return response;
    }
    
    console.log('レスポンスはオブジェクトではなく、パースが必要です');
    return null;
  }
  
  try {
    // モック関数のテスト
    const mockPrompt = "テストプロンプト";
    const mockResponse = mockClaudeResponse(mockPrompt);
    console.log('モックレスポンスタイプ:', typeof mockResponse);
    console.log('モックレスポンスサンプル:', { 
      summary: mockResponse.summary.substring(0, 30) + '...',
      hasLuckyPoints: !!mockResponse.luckyPoints,
      luckyColor: mockResponse.luckyPoints?.color,
      luckyItems: mockResponse.luckyPoints?.items
    });
    
    // パース関数のテスト
    const parsedResponse = parseAIResponse(mockResponse);
    console.log('パース結果タイプ:', typeof parsedResponse);
    console.log('パース結果サンプル:', { 
      summary: parsedResponse?.summary.substring(0, 30) + '...',
      hasLuckyPoints: !!parsedResponse?.luckyPoints,
      luckyColor: parsedResponse?.luckyPoints?.color,
      luckyItems: parsedResponse?.luckyPoints?.items
    });
    
    console.log('モックテスト結果: 成功 ✅ モック関数は正常に動作しています');
  } catch (error) {
    console.error('モックテスト中にエラーが発生しました:', error);
    console.log('モックテスト結果: 失敗 ❌');
  }
}

// テスト実行
(async () => {
  await testMockFunction();
  await testClaudeApi();
})();