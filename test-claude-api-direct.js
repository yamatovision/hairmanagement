/**
 * Claude APIへの直接アクセスで運勢アドバイスの生レスポンスを取得するテストスクリプト
 * 設定: npm install axios dotenv
 */
require('dotenv').config({ path: './backend/.env' });
const axios = require('axios');

// Claude APIの設定
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'dummy-api-key';
const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';

// APIキーログ（セキュリティのため最初と最後の数文字のみ表示）
const isKeyDummy = CLAUDE_API_KEY === 'dummy-api-key';
const keyLength = CLAUDE_API_KEY.length;
const keyPrefix = CLAUDE_API_KEY.substring(0, 5);
const keySuffix = CLAUDE_API_KEY.substring(keyLength - 3);
console.log(`APIキー情報: ${isKeyDummy ? 'ダミーキー' : keyPrefix + '...' + keySuffix} (${keyLength}文字)`);

// サンプルユーザープロファイル
const userProfile = {
  dayStem: '丙',
  dayBranch: '寅',
  mainElement: '火',
  yinYang: '陽'
};

// サンプル四柱情報
const fourPillars = {
  yearPillar: { stem: '己', branch: '巳', fullStemBranch: '己巳' },
  monthPillar: { stem: '丙', branch: '子', fullStemBranch: '丙子' },
  dayPillar: { stem: '丙', branch: '寅', fullStemBranch: '丙寅' },
  hourPillar: { stem: '辛', branch: '午', fullStemBranch: '辛午' }
};

// サンプル十神関係
const tenGodRelation = {
  year: '傷官',
  month: '比肩',
  day: '比肩',
  hour: '正財'
};

// Claude APIにリクエストを送信する関数
async function sendRequestToClaude() {
  try {
    // 四柱情報をフォーマット
    const formattedFourPillars = `年柱:${fourPillars.yearPillar.fullStemBranch}, 月柱:${fourPillars.monthPillar.fullStemBranch}, 日柱:${fourPillars.dayPillar.fullStemBranch}, 時柱:${fourPillars.hourPillar.fullStemBranch}`;
    
    // 十神関係の解釈
    const tenGodInterpretation = '自己の力が発揮されやすい日。積極的な行動が吉。';
    
    // プロンプト構築
    const prompt = `
あなたは四柱推命と五行の専門家です。以下の情報に基づいて今日の運勢とアドバイスを生成してください。

## ユーザープロフィール
- 五行属性: ${userProfile.yinYang}${userProfile.mainElement}
- 四柱: ${formattedFourPillars}

## 今日の暦情報
- 今日の四柱: 年柱:乙巳, 月柱:己卯, 日柱:戊戌, 時柱:乙午
- 十神関係: ${tenGodInterpretation}

## 目標情報
- 個人目標: AIプロダクト開発の効率化
- チーム目標: 四半期バイアウト目標の達成

## 出力形式
以下の正確な形式で出力してください。各セクションの見出しを含め、正確に指定された形式を守ることが非常に重要です：

1. 今日のあなたの運気
（必ず「あなたは今日、〇〇のような運気です」という形で始め、100-150文字で具体的なイメージや比喩を使い、ポジティブな表現で記述してください）

2. ラッキーポイント（五行理論に基づいて選定すること）
- ラッキーカラー: （今日の五行と相性の良い色を具体的に1つ指定）
- ラッキーアイテム: （今日の五行エネルギーを活かすアイテムを1-2つ）
- ラッキーナンバー: （1-9の数字を1つ、五行相関に基づいて）
- 開運アクション: （簡単にできる具体的な行動を15-20文字で）

3. 個人目標へのアドバイス
（「個人目標へのアドバイス」という見出しの後に、80-100文字で専門的かつ具体的なアドバイスを記述してください。ユーザーの個人目標「AIプロダクト開発の効率化」に関連したアドバイスを提供してください。）

4. チーム目標へのアドバイス
（「チーム目標へのアドバイス」という見出しの後に、80-100文字で職場での人間関係や協力に関する専門的なアドバイスを記述してください。チーム目標「四半期バイアウト目標の達成」に関連したアドバイスを提供してください。）

※出力形式を厳密に守り、各セクションの見出しを必ず含めてください。
※五行思想と十神関係に基づいた確かな裏付けのある内容にしてください。
※ラッキーポイントは表現は親しみやすくしつつも、背後には伝統的な五行理論の確かなロジックを持たせてください。
※ビジネス場面に適した内容を重視してください。
※パースのため各セクションの見出しを正確に記載することが非常に重要です。
`;

    console.log('\n=== 送信するプロンプト ===\n');
    console.log(prompt);
    
    // APIキーがダミーの場合は実際のリクエストを送信せず終了
    if (isKeyDummy) {
      console.error('ダミーAPIキーを使用しているため、実際のAPIリクエストは送信しません。');
      console.error('.envファイルなどでCLAUDE_API_KEYを正しく設定してください。');
      return;
    }
    
    console.log('\n=== Claude APIにリクエスト送信中... ===\n');
    
    // Claude APIにリクエスト送信
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: CLAUDE_MODEL,
        max_tokens: 5024,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );
    
    console.log('=== APIレスポンス ステータス ===');
    console.log(`ステータスコード: ${response.status}`);
    console.log(`レスポンス時間: ${response.headers['x-request-id'] || 'N/A'}`);
    
    console.log('\n=== APIレスポンス 構造 ===');
    console.log('レスポンスキー:', Object.keys(response.data));
    
    if (response.data.content && Array.isArray(response.data.content)) {
      console.log('コンテンツタイプ:', response.data.content.map(item => item.type).join(', '));
      
      // テキスト部分を抽出
      const text = response.data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
      
      console.log('\n=== 生の応答テキスト ===\n');
      console.log(text);
      
      // JSONとしてパース可能か試す
      try {
        if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
          console.log('\n=== JSONとしてパース ===\n');
          const parsed = JSON.parse(text);
          console.log(JSON.stringify(parsed, null, 2));
        }
      } catch (error) {
        console.log('\n=== JSONパース失敗 ===\n');
        console.log('レスポンスはJSON形式ではありません');
      }
    } else {
      console.log('\n=== 完全なレスポンスデータ ===\n');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
    // 使用トークン情報
    if (response.data.usage) {
      console.log('\n=== トークン使用状況 ===');
      console.log(`入力トークン: ${response.data.usage.input_tokens}`);
      console.log(`出力トークン: ${response.data.usage.output_tokens}`);
      console.log(`合計トークン: ${response.data.usage.input_tokens + response.data.usage.output_tokens}`);
    }
  } catch (error) {
    console.error('\n=== エラー発生 ===\n');
    
    if (error.response) {
      // APIからのエラーレスポンス
      console.error('ステータスコード:', error.response.status);
      console.error('エラーデータ:', error.response.data);
      console.error('エラーヘッダー:', error.response.headers);
    } else if (error.request) {
      // リクエストは送信されたがレスポンスが得られなかった場合
      console.error('レスポンスが受信できませんでした:', error.request);
    } else {
      // リクエスト設定時に発生したエラー
      console.error('エラーメッセージ:', error.message);
    }
    
    console.error('エラー詳細:', error);
  }
}

// スクリプト実行
sendRequestToClaude();