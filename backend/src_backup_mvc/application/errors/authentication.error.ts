import { ApplicationError } from './application.error';

/**
 * 認証エラー
 * ユーザー認証に関連するエラーを表す
 */
export class AuthenticationError extends ApplicationError {
  /**
   * コンストラクタ
   * @param message エラーメッセージ
   * @param details 追加詳細情報（オプション）
   */
  constructor(message: string, details?: any) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
  }
}