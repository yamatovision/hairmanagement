/**
 * ユーザーロール値オブジェクト
 * ユーザーの役割を表す値オブジェクト
 */
export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  ADMIN = 'admin',
  SUPER_ADMIN = 'superadmin'
}

/**
 * ロールの権限レベル
 * 数値が大きいほど権限が高い
 */
export const ROLE_PERMISSION_LEVEL = {
  [UserRole.EMPLOYEE]: 1,
  [UserRole.MANAGER]: 2,
  [UserRole.ADMIN]: 3,
  [UserRole.SUPER_ADMIN]: 4
};

/**
 * ロールの表示名
 */
export const ROLE_DISPLAY_NAMES = {
  [UserRole.EMPLOYEE]: '従業員',
  [UserRole.MANAGER]: '管理者',
  [UserRole.ADMIN]: '管理者(上級)',
  [UserRole.SUPER_ADMIN]: 'システム管理者'
};

/**
 * ロールが別のロールより権限が高いかチェックする
 * @param role チェックするロール
 * @param targetRole 比較対象のロール
 * @returns 権限が高い場合true
 */
export function hasHigherPermissionThan(role: UserRole, targetRole: UserRole): boolean {
  return ROLE_PERMISSION_LEVEL[role] > ROLE_PERMISSION_LEVEL[targetRole];
}

/**
 * ロールが同等以上の権限を持つかチェックする
 * @param role チェックするロール
 * @param targetRole 比較対象のロール
 * @returns 同等以上の権限を持つ場合true
 */
export function hasEqualOrHigherPermissionThan(role: UserRole, targetRole: UserRole): boolean {
  return ROLE_PERMISSION_LEVEL[role] >= ROLE_PERMISSION_LEVEL[targetRole];
}