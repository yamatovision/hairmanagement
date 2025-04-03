import { injectable, inject } from 'tsyringe';
import axios from 'axios';

/**
 * Anthropic Claude APIと通信するサービス
 */
@injectable()
export class ClaudeAIService {
  private apiKey: string;
  private apiUrl: string;

  constructor(
    @inject('ClaudeApiKey') apiKey: string,
    @inject('ClaudeApiUrl') apiUrl: string
  ) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  /**
   * メッセージを送信しレスポンスを受け取る
   * @param prompt ユーザープロンプト
   * @returns AIからのレスポンス
   */
  async sendMessage(prompt: string): Promise<any> {
    return this.generateText(prompt, {});
  }

  /**
   * テキストを生成する
   * @param prompt ユーザープロンプト
   * @param options オプション
   * @returns AIからのレスポンス
   */
  async generateText(prompt: string, options: any = {}): Promise<any> {
    try {
      // ロギング - リクエスト内容のサマリー
      console.log(`ClaudeAIService: Sending request to Claude API (${prompt.length} chars) with options:`, 
        JSON.stringify(options));
      
      // 実際の環境では本当のAPI呼び出しを行う
      if (this.apiKey !== 'dummy-api-key') {
        // モデルの選択（オプションから、なければデフォルト値）
        const model = options.model || 'claude-3-sonnet-20240229';
        // トークン数の設定（オプションから、なければデフォルト値）
        const maxTokens = options.maxTokens || 1000;
        
        console.log(`ClaudeAIService: Using model ${model} with max tokens ${maxTokens}`);
        
        const response = await axios.post(
          this.apiUrl,
          {
            model: model,
            max_tokens: maxTokens,
            messages: [{ role: 'user', content: prompt }]
          },
          {
            headers: {
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json'
            }
          }
        );
        
        // レスポンスの解析と詳細ログ出力
        console.log('ClaudeAIService: APIレスポンス受信:', {
          status: response.status,
          hasData: !!response.data,
          dataKeys: Object.keys(response.data || {}),
          hasContent: !!(response.data && response.data.content),
          contentType: response.data && response.data.content ? typeof response.data.content : 'undefined',
          isArray: response.data && response.data.content ? Array.isArray(response.data.content) : false,
          contentLength: response.data && response.data.content ? 
            (Array.isArray(response.data.content) ? response.data.content.length : 'not an array') : 0
        });
        
        // 完全なレスポンスデータのログを出力
        console.log('ClaudeAIService: 完全なレスポンスデータ（最初の1000文字）:',
          JSON.stringify(response.data).substring(0, 1000));
        
        if (response.data) {
          console.log('ClaudeAIService: APIレスポンス正常受信');
          
          // Claude API v2形式
          if (response.data.content && Array.isArray(response.data.content) && response.data.content.length > 0) {
            // contentがある場合の処理（Claude API形式）
            console.log('ClaudeAIService: Claude API v2形式のレスポンスを検出');
            
            // contentの各項目を分析
            response.data.content.forEach((item, index) => {
              console.log(`ClaudeAIService: content[${index}]:`, {
                type: item.type,
                hasText: !!item.text,
                textLength: item.text ? item.text.length : 0,
                textStart: item.text ? item.text.substring(0, 50) + '...' : 'なし'
              });
            });
            
            // テキスト部分を取得
            const responseText = response.data.content[0].text;
            console.log('ClaudeAIService: レスポンステキスト（最初の100文字）:', 
              responseText.substring(0, 100) + '...');
            
            try {
              // JSON形式かどうかチェック
              if (responseText.trim().startsWith('{') && responseText.trim().endsWith('}')) {
                console.log('ClaudeAIService: JSONレスポンスをパース試行');
                const parsedJson = JSON.parse(responseText);
                console.log('ClaudeAIService: JSONとしてパース成功 - オブジェクトとして返します', {
                  hasAIGeneratedAdvice: true,
                  fields: Object.keys(parsedJson),
                  hasLuckyPoints: !!parsedJson.luckyPoints,
                  luckyPointsFields: parsedJson.luckyPoints ? Object.keys(parsedJson.luckyPoints) : 'なし'
                });
                return parsedJson;
              }
            } catch (parseError) {
              console.log('ClaudeAIService: JSONパース失敗 - テキストとして処理します', parseError.message);
            }
            
            // 通常のテキストとして返す
            return responseText;
          } 
          // 他のAPIレスポンス形式の可能性を考慮
          else if (response.data.text || response.data.message || response.data.output) {
            // 別の既知のAPI形式の処理
            const responseText = response.data.text || response.data.message || response.data.output || '';
            console.log('ClaudeAIService: 代替APIレスポンス形式のテキストを検出', {
              length: responseText.length,
              start: responseText.substring(0, 50) + '...'
            });
            
            try {
              // JSON形式かどうかチェック
              if (responseText.trim().startsWith('{') && responseText.trim().endsWith('}')) {
                const parsedJson = JSON.parse(responseText);
                console.log('ClaudeAIService: 代替形式からJSONをパース成功');
                return parsedJson;
              }
            } catch (parseError) {
              console.log('ClaudeAIService: 代替形式からのJSONパース失敗');
            }
            
            return responseText;
          } 
          // 未知の形式の処理
          else {
            console.log('ClaudeAIService: 不明なレスポンス形式 - 完全なレスポンスを返します');
            return response.data;
          }
        } else {
          console.error('ClaudeAIService: 予期しないAPIレスポンス形式:', response.data);
          throw new Error('意図しないAPIレスポンス形式');
        }
      }
      
      // 開発環境用のモックレスポンス
      console.log('ClaudeAIService: Using mock response (dummy API key detected)');
      
      // 構造化されたモックレスポンスを直接返す（パース処理をスキップするため）
      // この方法なら、parseAIResponseメソッドを通さなくても正しい構造のデータを返せる
      console.log('ClaudeAIService: Returning structured mock response for easy parsing');
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
      
      // 構造化されたオブジェクトを文字列として返す場合 - parseAIResponseで処理されるため
      if (prompt.includes('USE_TEXT_RESPONSE')) {
        // パース可能なモックフォーマットを返す（テスト用）
        return `あなたは今日、清々しい風が吹き抜ける森のような運気です。新しいアイデアが自然と湧き上がり、周囲との調和も取れやすい一日となるでしょう。特に、チームでの創造的な活動が成功に結びつく暗示があります。思い切って新しい発想を形にすることで、大きな成果が期待できます。

ラッキーポイント（五行理論に基づいて選定すること）
- ラッキーカラー: 緑
- ラッキーアイテム: 観葉植物、木製のアクセサリー
- ラッキーナンバー: 3
- 開運アクション: 朝日を浴びながら深呼吸する

個人目標へのアドバイス
AIプロダクトの開発において、今日は特に「ユーザー体験」に焦点を当てると良いでしょう。技術的な側面よりも、実際の使用感や直感的な操作性を重視することで、より価値の高い成果が得られます。木の柔軟性のように臨機応変な対応を。

チーム目標へのアドバイス
バイアウト目標達成のためには、今日は特に情報の共有と透明性を高めることが重要です。メンバー間での正確な情報伝達が、予期せぬ障害を事前に回避するカギとなります。木が根を張るように、強固な信頼関係を築きましょう。`;
      }
      
      // 構造化されたオブジェクトを直接返す
      // オブジェクトとして直接返すことでパース処理をスキップ
      return structuredMockResponse;
    } catch (error) {
      // エラー詳細のロギング
      console.error('Claude API呼び出し中にエラーが発生しました:', error);
      if (error instanceof Error) {
        console.error('エラーメッセージ:', error.message);
        console.error('スタックトレース:', error.stack);
      }
      // エラー情報を含めてスローする
      throw new Error(`AI応答の生成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * 画像生成 (将来の実装用のスタブ)
   */
  async generateImage(prompt: string): Promise<string> {
    // 実装はまだありません
    return 'https://example.com/placeholder-image.png';
  }
}