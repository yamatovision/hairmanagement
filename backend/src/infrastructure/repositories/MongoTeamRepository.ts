/**
 * MongoDBを使用したチームリポジトリの実装
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import { inject, injectable } from 'tsyringe';
import { BaseRepository } from './base/BaseRepository';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { Team } from '../../domain/entities/Team';
import mongoose from 'mongoose';
import { ITeamDocument } from '../../domain/models/team.model';

/**
 * MongoDBを使用したチームリポジトリの実装
 */
@injectable()
export class MongoTeamRepository implements ITeamRepository {
  private baseRepo: BaseRepository<Team, string>;
  
  /**
   * コンストラクタ
   * @param teamModel TeamモデルのMongooseインスタンス
   */
  constructor(
    @inject('TeamModel') private teamModel: any
  ) {
    // BaseRepositoryImpl 実装クラスを作成
    this.baseRepo = {
      create: this.create.bind(this),
      findById: this.findById.bind(this),
      findAll: this.findAll.bind(this),
      findByFilter: this.findByFilter.bind(this),
      update: this.updateBase.bind(this),
      delete: this.deleteBase.bind(this)
    } as BaseRepository<Team, string>;
  }

  /**
   * Mongooseドキュメントからドメインエンティティへの変換
   * @param doc MongooseのTeamドキュメント
   * @returns ドメインエンティティのTeam
   */
  protected toDomainEntity(doc: ITeamDocument): Team {
    // ownerIdが必須なので、不足している場合はエラーのリスクを避けるための対応
    const ownerId = doc.ownerId ? doc.ownerId.toString() : '';
    
    return new Team(
      doc._id.toString(),
      doc.name || '',  // nameが未定義の場合は空文字を使用
      doc.description || '',  // descriptionも同様に処理
      ownerId,
      doc.isActive,
      doc.admins ? doc.admins.map(adminId => adminId.toString()) : [],
      doc.members ? doc.members.map(member => ({
        userId: member.userId.toString(),
        role: member.position || 'member', // positionをroleとして使用、ない場合はデフォルト値
        joinedAt: member.joinedAt
      })) : [],
      doc.goal,
      doc.createdAt
    );
  }

  /**
   * ドメインエンティティからMongooseモデルデータへの変換
   * @param entity ドメインエンティティのTeam
   * @returns MongooseモデルデータとしてのTeam
   */
  protected toModelData(entity: Team): any {
    const modelData: any = {
      name: entity.name,
      description: entity.description,
      ownerId: entity.ownerId,
      admins: entity.admins,
      members: entity.members.map(member => ({
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt
      })),
      isActive: entity.isActive,
      goal: entity.goal
    };

    if (entity.id) {
      modelData._id = entity.id;
    }

    return modelData;
  }

  /**
   * エンティティを作成する
   * @param entity 作成するエンティティ
   * @returns 作成されたエンティティ
   */
  async create(entity: Team): Promise<Team> {
    const modelData = this.toModelData(entity);
    const created = await this.teamModel.create(modelData);
    return this.toDomainEntity(created);
  }

  /**
   * IDによってエンティティを検索する
   * @param id エンティティのID
   * @returns 見つかったエンティティまたはnull
   */
  async findById(id: string): Promise<Team | null> {
    const found = await this.teamModel.findById(id).exec();
    if (!found) {
      return null;
    }
    return this.toDomainEntity(found);
  }

  /**
   * すべてのエンティティを取得する
   * @returns エンティティの配列
   */
  async findAll(): Promise<Team[]> {
    const all = await this.teamModel.find().exec();
    return all.map(item => this.toDomainEntity(item));
  }

  /**
   * 条件に合致するエンティティを検索する
   * @param filter 検索条件
   * @returns 条件に合致するエンティティの配列
   */
  async findByFilter(filter: object): Promise<Team[]> {
    const found = await this.teamModel.find(filter).exec();
    return found.map(item => this.toDomainEntity(item));
  }

  /**
   * ベースのupdate実装（内部使用）
   * @param id 更新するエンティティのID
   * @param entity 更新データを含むエンティティ
   * @returns 更新されたエンティティ
   */
  private async updateBase(id: string, entity: Partial<Team>): Promise<Team | null> {
    const modelData = this.toModelData(entity as Team);
    
    // IDやその他のメタデータフィールドを削除
    delete modelData._id;
    delete modelData.id;
    delete modelData.createdAt;
    
    const updated = await this.teamModel.findByIdAndUpdate(
      id,
      { $set: modelData },
      { new: true }
    ).exec();
    
    if (!updated) {
      return null;
    }
    
    return this.toDomainEntity(updated);
  }

  /**
   * ベースのdelete実装（内部使用）
   * @param id 削除するエンティティのID
   * @returns 削除操作の結果
   */
  private async deleteBase(id: string): Promise<boolean> {
    const result = await this.teamModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  /**
   * メンバーIDによるチーム検索
   * @param memberId メンバーのユーザーID
   * @returns 該当するメンバーが所属するチーム
   */
  async findByMemberId(memberId: string): Promise<Team | null> {
    const team = await this.teamModel.findOne({
      $or: [
        { ownerId: memberId },
        { admins: memberId },
        { 'members.userId': memberId }
      ]
    }).exec();

    if (!team) {
      return null;
    }

    return this.toDomainEntity(team);
  }

  /**
   * オーナーIDによるチーム検索
   * @param ownerId オーナーのユーザーID
   * @returns 該当するオーナーが所有するチームの配列
   */
  async findByOwnerId(ownerId: string): Promise<Team[]> {
    const teams = await this.teamModel.find({ ownerId }).exec();
    return teams.map(team => this.toDomainEntity(team));
  }

  /**
   * チーム情報の保存
   * @param team 保存するチームエンティティ
   * @returns 保存されたチームエンティティ
   */
  async save(team: Team): Promise<Team> {
    return this.create(team);
  }

  /**
   * チーム情報の更新
   * @param team 更新するチームエンティティ
   * @returns 更新されたチームエンティティ
   */
  async update(team: Team): Promise<Team> {
    const updated = await this.updateBase(team.id, team);
    if (!updated) {
      throw new Error(`Team with id ${team.id} not found`);
    }
    return updated;
  }

  /**
   * チームの削除
   * @param id 削除するチームID
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.deleteBase(id);
    if (!deleted) {
      throw new Error(`Team with id ${id} not found`);
    }
  }

  /**
   * チームメンバーの追加
   * @param teamId チームID
   * @param memberId 追加するメンバーID
   * @param role メンバーの役割
   * @returns 更新されたチームエンティティ
   */
  async addMember(teamId: string, memberId: string, role: string): Promise<Team> {
    const team = await this.findById(teamId);
    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }

    team.addMember(memberId, role);
    return this.update(team);
  }

  /**
   * チームメンバーの削除
   * @param teamId チームID
   * @param memberId 削除するメンバーID
   * @returns 更新されたチームエンティティ
   */
  async removeMember(teamId: string, memberId: string): Promise<Team> {
    const team = await this.findById(teamId);
    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }

    team.removeMember(memberId);
    return this.update(team);
  }

  /**
   * チームメンバーの役割更新
   * @param teamId チームID
   * @param memberId メンバーID
   * @param newRole 新しい役割
   * @returns 更新されたチームエンティティ
   */
  async updateMemberRole(teamId: string, memberId: string, newRole: string): Promise<Team> {
    const team = await this.findById(teamId);
    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }

    team.updateMemberRole(memberId, newRole);
    return this.update(team);
  }

  /**
   * チーム目標の更新
   * @param teamId チームID
   * @param goal 新しいチーム目標
   * @returns 更新されたチームエンティティ
   */
  async updateGoal(teamId: string, goal: string): Promise<Team> {
    const team = await this.findById(teamId);
    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }

    team.updateGoal(goal);
    return this.update(team);
  }
}