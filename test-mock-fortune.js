/**
 * モックレスポンスのテスト用ファイル
 */
require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

/**
 * DailyFortuneServiceのparseAIResponseをシミュレート
 */
function parseAIResponse(response) {
  console.log('レスポンスタイプ:', typeof response);
  
  if (typeof response === 'object' && response !== null) {
    console.log('オブジェクトが直接渡されました');
    
    // 必要な構造をチェック
    const requiredFields = ['summary', 'personalAdvice', 'teamAdvice', 'luckyPoints'];
    const missingFields = requiredFields.filter(field => !response[field]);
    
    if (missingFields.length > 0) {
      console.log('警告: オブジェクトに不足しているフィールドがあります:', missingFields);
    }
    
    // luckyPointsがある場合は内部構造もチェック
    if (response.luckyPoints) {
      console.log('luckyPointsの検証:', {
        hasColor: !!response.luckyPoints.color,
        hasItems: !!response.luckyPoints.items,
        isItemsArray: Array.isArray(response.luckyPoints.items),
        hasNumber: !!response.luckyPoints.number,
        hasAction: !!response.luckyPoints.action
      });
      
      // luckyPoints.itemsが配列でない場合は配列に変換
      if (response.luckyPoints.items && !Array.isArray(response.luckyPoints.items)) {
        console.log('luckyPoints.itemsを配列に変換します');
        response.luckyPoints.items = [String(response.luckyPoints.items)];
      }
    }
    
    return response;
  }
  
  // テキストレスポンスの処理（省略）
  return null;
}

/**
 * モック関数をテスト
 */
function testMockFunction() {
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

/**
 * AIレスポンスをエンリッチするテスト
 */
function testEnrichFortuneData() {
  console.log('\n=== 運勢データのエンリッチテスト ===');
  
  // モック運勢データ
  const fortune = {
    id: 'fortune-1234',
    userId: 'user-1234',
    date: new Date(),
    overallScore: 85,
    rating: 'excellent',
    advice: {
      summary: "あなたは今日、清々しい風が吹き抜ける森のような運気です。",
      personalAdvice: "AIプロダクトの開発において、今日は特に「ユーザー体験」に焦点を当てると良いでしょう。",
      teamAdvice: "バイアウト目標達成のためには、今日は特に情報の共有と透明性を高めることが重要です。",
      luckyPoints: {
        color: "緑",
        items: ["観葉植物", "木製のアクセサリー"],
        number: 3,
        action: "朝日を浴びながら深呼吸する"
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // エンリッチ関数
  function enrichFortuneData(fortune) {
    // 日付をYYYY-MM-DD形式に変換
    const dateStr = fortune.date instanceof Date 
      ? fortune.date.toISOString().split('T')[0]
      : new Date(fortune.date).toISOString().split('T')[0];
      
    // AIアドバイスが構造化されているか確認
    const aiGeneratedAdvice = typeof fortune.advice === 'object' ? fortune.advice : null;
    
    // ドメインモデルからフロントエンド用のレスポンス形式に変換
    return {
      id: fortune.id || `fortune-${fortune.userId}-${dateStr}`,
      date: dateStr,
      overallScore: fortune.overallScore,
      starRating: Math.ceil(fortune.overallScore / 20), // 5段階評価に変換（1-5）
      rating: fortune.rating,
      advice: typeof fortune.advice === 'string' ? fortune.advice : 'アドバイスは構造化形式で提供されています',
      // 新しい構造化されたアドバイス形式
      aiGeneratedAdvice: aiGeneratedAdvice,
      createdAt: fortune.createdAt instanceof Date 
        ? fortune.createdAt.toISOString()
        : new Date(fortune.createdAt).toISOString()
    };
  }
  
  try {
    // エンリッチ関数をテスト
    const enrichedFortune = enrichFortuneData(fortune);
    console.log('エンリッチされた運勢データ:', {
      id: enrichedFortune.id,
      date: enrichedFortune.date,
      overallScore: enrichedFortune.overallScore,
      starRating: enrichedFortune.starRating,
      hasAiGeneratedAdvice: !!enrichedFortune.aiGeneratedAdvice
    });
    
    if (enrichedFortune.aiGeneratedAdvice) {
      console.log('AIGeneratedAdvice詳細:', {
        summary: enrichedFortune.aiGeneratedAdvice.summary.substring(0, 30) + '...',
        hasLuckyPoints: !!enrichedFortune.aiGeneratedAdvice.luckyPoints,
        luckyColor: enrichedFortune.aiGeneratedAdvice.luckyPoints?.color,
        luckyItems: enrichedFortune.aiGeneratedAdvice.luckyPoints?.items
      });
    }
    
    console.log('エンリッチテスト結果: 成功 ✅ 運勢データが正常にエンリッチされました');
  } catch (error) {
    console.error('エンリッチテスト中にエラーが発生しました:', error);
    console.log('エンリッチテスト結果: 失敗 ❌');
  }
}

/**
 * テスト実行
 */
(async () => {
  console.log('=== Claude APIレスポンス処理と運勢データテスト ===');
  console.log('テスト開始時刻:', new Date().toISOString());
  
  // 環境変数の確認
  const apiKey = process.env.CLAUDE_API_KEY || 'not-set';
  console.log('CLAUDE_API_KEY:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));
  console.log('CLAUDE_API_URL:', process.env.CLAUDE_API_URL);
  
  await testMockFunction();
  await testEnrichFortuneData();
  
  console.log('\nすべてのテスト完了');
})();