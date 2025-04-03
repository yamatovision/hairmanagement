import { Entity } from './Entity';

/**
 * 会話タイプ
 */
export enum ConversationType {
  GENERAL = 'general',
  FORTUNE = 'fortune',
  TEAM_COMPATIBILITY = 'team_compatibility',
  DAILY_REPORT = 'daily_report',
  TEAM_CONSULTATION = 'team_consultation',
  TEAM_MEMBER = 'team_member'
}

/**
 * 会話メッセージインターフェース
 */
export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  createdAt: Date;
}

/**
 * 会話エンティティ
 * ユーザーとAIアシスタント間の会話を表すドメインエンティティ
 */
export interface Conversation extends Entity<string> {
  /**
   * 会話の所有者であるユーザーのID
   */
  userId: string;
  
  /**
   * 会話タイプ
   */
  type: ConversationType;
  
  /**
   * 会話内のメッセージリスト
   */
  messages: Message[];
  
  /**
   * アーカイブ済みフラグ
   */
  isArchived?: boolean;
  
  /**
   * 作成日時
   */
  createdAt: Date;
  
  /**
   * 更新日時
   */
  updatedAt: Date;
}