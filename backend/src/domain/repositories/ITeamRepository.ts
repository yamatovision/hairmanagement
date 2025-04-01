/**
 * チームリポジトリインターフェース
 * チームの永続化と取得を担当
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import { Team } from '../entities/Team';

/**
 * チームリポジトリインターフェース
 */
export interface ITeamRepository {
  /**
   * 全てのチームを取得
   */
  findAll(): Promise<Team[]>;
  
  /**
   * IDによるチーム検索
   * @param id チームID
   */
  findById(id: string): Promise<Team | null>;
  
  /**
   * メンバーIDによるチーム検索
   * @param memberId メンバーのユーザーID
   */
  findByMemberId(memberId: string): Promise<Team | null>;
  
  /**
   * オーナーIDによるチーム検索
   * @param ownerId オーナーのユーザーID
   */
  findByOwnerId(ownerId: string): Promise<Team[]>;
  
  /**
   * チーム情報の保存
   * @param team 保存するチームエンティティ
   */
  save(team: Team): Promise<Team>;
  
  /**
   * チーム情報の更新
   * @param team 更新するチームエンティティ
   */
  update(team: Team): Promise<Team>;
  
  /**
   * チームの削除
   * @param id 削除するチームID
   */
  delete(id: string): Promise<void>;
  
  /**
   * チームメンバーの追加
   * @param teamId チームID
   * @param memberId 追加するメンバーID
   * @param role メンバーの役割
   */
  addMember(teamId: string, memberId: string, role: string): Promise<Team>;
  
  /**
   * チームメンバーの削除
   * @param teamId チームID
   * @param memberId 削除するメンバーID
   */
  removeMember(teamId: string, memberId: string): Promise<Team>;
  
  /**
   * チームメンバーの役割更新
   * @param teamId チームID
   * @param memberId メンバーID
   * @param newRole 新しい役割
   */
  updateMemberRole(teamId: string, memberId: string, newRole: string): Promise<Team>;
  
  /**
   * チーム目標の更新
   * @param teamId チームID
   * @param goal 新しいチーム目標
   */
  updateGoal(teamId: string, goal: string): Promise<Team>;
}