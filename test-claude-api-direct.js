/**
 * Claude APIへの直接接続テスト
 * APIキーが正常に機能していることを確認します
 */
require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

/**
 * Claude APIに直接リクエストを送信
 */
async function testClaudeApiDirect() {
  console.log('\n=== Claude API 直接接続テスト ===');
  
  try {
    // APIキーと接続先を取得
    const apiKey = process.env.CLAUDE_API_KEY;
    const apiUrl = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    const model = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';
    
    // APIキーのチェック
    if (!apiKey) {
      console.error('エラー: APIキーが設定されていません');
      return false;
    }
    
    const keyLength = apiKey.length;
    const keyPrefix = apiKey.substring(0, 8);
    const keySuffix = apiKey.substring(keyLength - 4);
    
    console.log(`APIキー: ${keyPrefix}...${keySuffix} (${keyLength}文字)`);
    console.log(`API URL: ${apiUrl}`);
    console.log(`モデル: ${model}`);
    
    // テスト用の運勢生成プロンプト
    const prompt = `
あなたは四柱推命と五行の専門家です。今日の運勢とアドバイスを生成してください。

出力は必ず以下のJSON形式で、タグや余計な説明なしに生成してください：
{
  "summary": "（今日の運勢の要約、100-150文字）",
  "personalAdvice": "（個人目標へのアドバイス、80-100文字）",
  "teamAdvice": "（チーム目標へのアドバイス、80-100文字）",
  "luckyPoints": {
    "color": "（今日のラッキーカラー）",
    "items": ["（ラッキーアイテム1）", "（ラッキーアイテム2）"],
    "number": （1-9の数字）,
    "action": "（開運アクション、15-20文字）"
  }
}
    `;

    console.log('リクエスト送信中...');
    console.time('API応答時間');
    
    // リクエスト送信
    const response = await axios.post(
      apiUrl,
      {
        model: model,
        max_tokens: 1000,
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
    
    console.timeEnd('API応答時間');
    
    // レスポンスのチェック
    if (response.status !== 200) {
      console.error(`エラー: APIが${response.status}を返しました`);
      console.error('レスポンス:', response.data);
      return false;
    }
    
    if (!response.data || !response.data.content || !response.data.content.length) {
      console.error('エラー: APIレスポンスの形式が無効です');
      console.error('レスポンス:', response.data);
      return false;
    }
    
    // テキストの取得
    const text = response.data.content[0].text;
    console.log('\n--- APIレスポンステキスト ---');
    console.log(text.substring(0, 300) + (text.length > 300 ? '...' : ''));
    
    // JSONとして解析を試みる
    try {
      // 行頭と行末の空白、コードブロック記号を削除
      const cleanedText = text.trim().replace(/```json\s*|\s*```/g, '');
      const jsonData = JSON.parse(cleanedText);
      
      console.log('\n--- パース済みJSONデータ ---');
      console.log('summary:', jsonData.summary.substring(0, 50) + '...');
      console.log('personalAdvice:', jsonData.personalAdvice.substring(0, 50) + '...');
      console.log('teamAdvice:', jsonData.teamAdvice.substring(0, 50) + '...');
      console.log('luckyPoints:', {
        color: jsonData.luckyPoints.color,
        items: jsonData.luckyPoints.items,
        number: jsonData.luckyPoints.number,
        action: jsonData.luckyPoints.action
      });
      
      console.log('\nテスト結果: 成功 ✅ APIは正常に機能し、有効な形式のレスポンスを返しました');
      return true;
    } catch (parseError) {
      console.error('エラー: JSONの解析に失敗しました');
      console.error('解析エラー:', parseError.message);
      console.error('解析を試みたテキスト:', text.substring(0, 100) + '...');
      return false;
    }
    
  } catch (error) {
    console.error('エラー: API接続に失敗しました');
    console.error('エラーメッセージ:', error.message);
    
    if (error.response) {
      console.error('ステータスコード:', error.response.status);
      console.error('レスポンスデータ:', error.response.data);
    }
    
    return false;
  }
}

/**
 * APIからのレスポンスのDailyFortuneService処理をシミュレート
 */
function processApiResponse(jsonResponse) {
  console.log('\n=== API JSON処理テスト ===');
  
  try {
    console.log('受信したJSONデータの検証...');
    
    // 必須フィールドの確認
    const requiredFields = ['summary', 'personalAdvice', 'teamAdvice', 'luckyPoints'];
    const missingFields = requiredFields.filter(field => !jsonResponse[field]);
    
    if (missingFields.length > 0) {
      console.error('警告: 必須フィールドが欠けています:', missingFields);
      return false;
    }
    
    // luckyPointsの検証
    if (jsonResponse.luckyPoints) {
      const luckyRequiredFields = ['color', 'items', 'number', 'action'];
      const missingLuckyFields = luckyRequiredFields.filter(field => 
        jsonResponse.luckyPoints[field] === undefined);
      
      if (missingLuckyFields.length > 0) {
        console.error('警告: luckyPointsに必須フィールドが欠けています:', missingLuckyFields);
        return false;
      }
      
      // itemsが配列かチェック
      if (!Array.isArray(jsonResponse.luckyPoints.items)) {
        console.log('luckyPoints.itemsが配列ではありません。配列に変換します。');
        jsonResponse.luckyPoints.items = [String(jsonResponse.luckyPoints.items)];
      }
      
      console.log('luckyPoints構造の検証:', {
        hasColor: !!jsonResponse.luckyPoints.color,
        itemsIsArray: Array.isArray(jsonResponse.luckyPoints.items),
        itemsCount: jsonResponse.luckyPoints.items.length,
        numberIsValid: Number.isInteger(jsonResponse.luckyPoints.number),
        hasAction: !!jsonResponse.luckyPoints.action
      });
    } else {
      console.error('警告: luckyPointsフィールドがありません');
      return false;
    }
    
    // 運勢エンティティを生成（実際のサービスをシミュレート）
    const fortuneEntity = {
      id: 'fortune-test-' + Date.now(),
      userId: 'test-user-id',
      date: new Date(),
      overallScore: 80,
      rating: 'excellent',
      advice: jsonResponse, // AIからのレスポンスをそのまま格納
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // フロントエンド用にエンリッチ
    const enrichedFortune = {
      id: fortuneEntity.id,
      date: fortuneEntity.date.toISOString().split('T')[0],
      overallScore: fortuneEntity.overallScore,
      starRating: 4,
      rating: fortuneEntity.rating,
      aiGeneratedAdvice: fortuneEntity.advice, // AIアドバイスをそのまま使用
      createdAt: fortuneEntity.createdAt.toISOString()
    };
    
    console.log('エンリッチされた運勢データ:', {
      id: enrichedFortune.id,
      date: enrichedFortune.date,
      rating: enrichedFortune.rating,
      summary: enrichedFortune.aiGeneratedAdvice.summary.substring(0, 30) + '...',
      luckyColor: enrichedFortune.aiGeneratedAdvice.luckyPoints.color
    });
    
    console.log('テスト結果: 成功 ✅ API JSONデータを正常に処理し、運勢データに変換できました');
    return true;
  } catch (error) {
    console.error('エラー: JSONデータの処理中にエラーが発生しました');
    console.error(error);
    return false;
  }
}

/**
 * テスト実行
 */
(async () => {
  console.log('=== Claude API実機能テスト ===');
  console.log('テスト開始:', new Date().toISOString());
  
  // 環境変数の確認
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error('エラー: APIキーが設定されていません');
    process.exit(1);
  }
  
  // APIに直接リクエスト
  const apiSuccess = await testClaudeApiDirect();
  
  if (apiSuccess) {
    // テスト用のJSONレスポンス
    const sampleResponse = {
      summary: "あなたは今日、清々しい風が吹き抜ける森のような運気です。新しいアイデアが自然と湧き上がり、周囲との調和も取れやすい一日となるでしょう。特に、チームでの創造的な活動が成功に結びつく暗示があります。思い切って新しい発想を形にすることで、大きな成果が期待できます。",
      personalAdvice: "AIプロダクトの開発において、今日は特に「ユーザー体験」に焦点を当てると良いでしょう。技術的な側面よりも、実際の使用感や直感的な操作性を重視することで、より価値の高い成果が得られます。",
      teamAdvice: "バイアウト目標達成のためには、今日は特に情報の共有と透明性を高めることが重要です。メンバー間での正確な情報伝達が、予期せぬ障害を事前に回避するカギとなります。",
      luckyPoints: {
        color: "緑",
        items: ["観葉植物", "木製のアクセサリー"],
        number: 3,
        action: "朝日を浴びながら深呼吸する"
      }
    };
    
    // JSONデータの処理シミュレーション
    const processSuccess = processApiResponse(sampleResponse);
    
    console.log('\n=== テスト総合結果 ===');
    console.log('API接続テスト:', apiSuccess ? '成功 ✅' : '失敗 ❌');
    console.log('JSON処理テスト:', processSuccess ? '成功 ✅' : '失敗 ❌');
    
    if (apiSuccess && processSuccess) {
      console.log('\n全体結果: 成功 ✅ APIキーは正常に機能しており、レスポンスを適切に処理できます。');
    } else {
      console.log('\n全体結果: 一部の問題 ⚠️ 詳細なログを確認してください。');
    }
  } else {
    console.log('\n全体結果: 失敗 ❌ API接続に問題があります。');
  }
})();