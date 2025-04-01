/**
 * ユーザーステータス値オブジェクト
 * ユーザーのアカウント状態を表す値オブジェクト
 */
export enum UserStatus {
  ACTIVE = 'active',      // アクティブなユーザー
  INACTIVE = 'inactive',  // 無効化されたユーザー
  PENDING = 'pending'     // 保留中のユーザー（メール確認待ちなど）
}

/**
 * ステータスの表示名
 */
export const STATUS_DISPLAY_NAMES = {
  [UserStatus.ACTIVE]: 'アクティブ',
  [UserStatus.INACTIVE]: '無効',
  [UserStatus.PENDING]: '保留中'
};

/**
 * ユーザーがアクティブかどうかをチェックする
 * @param status ユーザーステータス
 * @returns アクティブならtrue
 */
export function isActive(status: UserStatus): boolean {
  return status === UserStatus.ACTIVE;
}

/**
 * ステータスがアクティブに変更可能かチェックする
 * @param status 現在のステータス
 * @returns アクティブに変更可能ならtrue
 */
export function canActivate(status: UserStatus): boolean {
  return status !== UserStatus.ACTIVE;
}