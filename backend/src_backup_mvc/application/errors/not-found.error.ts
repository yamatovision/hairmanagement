import { ApplicationError } from './application.error';

/**
 * 未検出エラー
 * リソースが見つからない場合のエラーを表す
 */
export class NotFoundError extends ApplicationError {
  /**
   * コンストラクタ
   * @param message エラーメッセージ
   * @param details エラー詳細情報（オプション）
   */
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND', 404, details);
  }
}