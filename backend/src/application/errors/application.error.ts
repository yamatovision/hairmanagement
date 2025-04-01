/**
 * アプリケーションエラー基底クラス
 * アプリケーション層で発生するすべてのエラーの基底クラス
 */
export class ApplicationError extends Error {
  /**
   * コンストラクタ
   * @param message エラーメッセージ
   * @param code エラーコード（オプション）
   * @param statusCode HTTPステータスコード（オプション）
   * @param details エラー詳細情報（オプション）
   */
  constructor(
    message: string,
    public readonly code: string = 'APPLICATION_ERROR',
    public readonly statusCode: number = 500,
    public readonly details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * エラーオブジェクトをJSON形式に変換する
   * @returns JSON形式のエラーオブジェクト
   */
  toJSON() {
    return {
      message: this.message,
      code: this.code,
      details: this.details
    };
  }
}