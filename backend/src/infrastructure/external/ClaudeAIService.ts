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
    try {
      // API呼び出しの実装 (モック)
      console.log('ClaudeAIService: Sending message to Claude API');
      
      // 実際の環境では本当のAPI呼び出しを行う
      if (this.apiKey !== 'dummy-api-key') {
        const response = await axios.post(
          this.apiUrl,
          {
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
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
        
        return response.data.content[0];
      }
      
      // ダミーレスポンス
      return {
        role: 'assistant',
        content: 'これはClaudeのモックレスポンスです。本番環境では実際のAPIからのレスポンスが返されます。'
      };
    } catch (error) {
      console.error('Claude API呼び出し中にエラーが発生しました:', error);
      throw new Error('AI応答の生成に失敗しました');
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