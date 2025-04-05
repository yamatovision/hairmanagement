/**
 * AI サービスインターフェース
 * 各種AIサービスの実装のための共通インターフェース
 */
export interface IAIService {
  /**
   * メッセージを送信しレスポンスを受け取る
   * @param messagesOrPrompt ユーザープロンプトまたはメッセージ履歴の配列
   * @param options 追加オプション
   * @returns AIからのレスポンス
   */
  sendMessage(
    messagesOrPrompt: string | Array<{role: string, content: string}>, 
    options?: any
  ): Promise<any>;
  
  /**
   * テキストを生成する
   * @param prompt ユーザープロンプト
   * @param options オプション
   * @returns AIからのレスポンス
   */
  generateText?(prompt: string, options?: any): Promise<any>;
  
  /**
   * メッセージ配列を使ってテキストを生成する
   * @param messages メッセージの配列
   * @param options オプション
   * @returns AIからのレスポンス
   */
  generateTextWithMessages?(messages: Array<{role: string, content: string}>, options?: any): Promise<any>;
  
  /**
   * 画像生成
   * @param prompt 画像生成用のプロンプト
   * @returns 生成された画像のURL
   */
  generateImage?(prompt: string): Promise<string>;
}