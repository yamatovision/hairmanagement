import { Entity } from './Entity';

/**
 * ユーザーロール
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff'
}

/**
 * ユーザーステータス
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

/**
 * ユーザーエンティティ
 * システムのユーザーを表すドメインエンティティ
 */
export interface User extends Entity<string> {
  /**
   * ユーザーのメールアドレス
   */
  email: string;
  
  /**
   * ユーザーの氏名
   */
  name: string;
  
  /**
   * ユーザーの役割
   */
  role: UserRole;
  
  /**
   * ユーザーのステータス
   */
  status: UserStatus;
  
  /**
   * ユーザーの陰陽五行属性
   */
  elementalAttributes?: {
    primaryElement?: string;
    secondaryElement?: string;
    yin?: number;
    yang?: number;
  };
  
  /**
   * ユーザープロフィール画像のURL
   */
  profileImage?: string;
  
  /**
   * パスワードハッシュ
   * ドメインエンティティに含めるべきではないが、
   * 現在の実装との互換性のために含めている
   */
  password?: string;
}