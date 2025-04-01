import { ApplicationError } from './application.error';

/**
 * バリデーションエラー
 * 入力データの検証に失敗した場合のエラーを表す
 */
export class ValidationError extends ApplicationError {
  /**
   * コンストラクタ
   * @param message エラーメッセージ
   * @param details 検証エラーの詳細（オプション）
   */
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}