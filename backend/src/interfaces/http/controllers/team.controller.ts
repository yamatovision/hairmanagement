/**
 * チームコントローラー
 * 
 * チーム関連のHTTPリクエストを処理する
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import { Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { AuthenticatedRequest } from '../../../types/express';
import { TeamCompatibilityService } from '../../../application/services/team-compatibility.service';
import { ITeamRepository } from '../../../domain/repositories/ITeamRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Team } from '../../../domain/entities/Team';
import { NotFoundError } from '../../../application/errors/not-found.error';
import { ValidationError } from '../../../application/errors/validation.error';

/**
 * チームコントローラー
 */
@injectable()
export class TeamController {
  constructor(
    @inject('ITeamRepository') private teamRepository: ITeamRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('TeamCompatibilityService') private teamCompatibilityService: TeamCompatibilityService
  ) {}

  /**
   * ユーザーが所属するチーム一覧を取得
   */
  async getUserTeams(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      
      // 所有チームを取得
      const ownedTeams = await this.teamRepository.findByOwnerId(userId);
      
      // メンバーとして所属しているチームを取得
      const memberTeam = await this.teamRepository.findByMemberId(userId);
      
      // 重複を避けつつ結合
      const teams = [...ownedTeams];
      if (memberTeam && !teams.some(team => team.id === memberTeam.id)) {
        teams.push(memberTeam);
      }
      
      res.json(teams);
    } catch (error) {
      next(error);
    }
  }

  /**
   * チーム詳細を取得
   */
  async getTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const userId = req.user.id;
      
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      
      // チームメンバーかどうかを確認
      if (!team.isMember(userId)) {
        throw new NotFoundError('Team not found or access denied');
      }
      
      res.json(team);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 新しいチームを作成
   */
  async createTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, goal } = req.body;
      const userId = req.user.id;
      
      // バリデーション
      if (!name || name.trim() === '') {
        throw new ValidationError('Team name is required');
      }
      
      // ユーザー存在確認
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      
      // チーム作成
      const team = Team.create(
        name,
        description || '',
        userId,
        goal || ''
      );
      
      // 永続化
      const savedTeam = await this.teamRepository.save(team);
      
      res.status(201).json(savedTeam);
    } catch (error) {
      next(error);
    }
  }

  /**
   * チーム情報を更新
   */
  async updateTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { name, description, goal, isActive } = req.body;
      const userId = req.user.id;
      
      // チーム取得
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      
      // 権限確認（オーナーまたは管理者のみ更新可能）
      if (!team.isAdmin(userId)) {
        throw new ValidationError('Only team owner or admin can update team information');
      }
      
      // 更新
      if (name !== undefined && name.trim() !== '') {
        team.name = name;
      }
      
      if (description !== undefined) {
        team.description = description;
      }
      
      if (goal !== undefined) {
        team.updateGoal(goal);
      }
      
      // アクティブ状態の更新はオーナーのみ可能
      if (isActive !== undefined && team.isOwner(userId)) {
        team.setActive(isActive);
      }
      
      // 永続化
      const updatedTeam = await this.teamRepository.update(team);
      
      res.json(updatedTeam);
    } catch (error) {
      next(error);
    }
  }

  /**
   * チームを削除
   */
  async deleteTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const userId = req.user.id;
      
      // チーム取得
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      
      // 権限確認（オーナーのみ削除可能）
      if (!team.isOwner(userId)) {
        throw new ValidationError('Only team owner can delete the team');
      }
      
      // 削除
      await this.teamRepository.delete(teamId);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * チームにメンバーを追加
   */
  async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { userId, role } = req.body;
      const currentUserId = req.user.id;
      
      // チーム取得
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      
      // 権限確認（オーナーまたは管理者のみメンバー追加可能）
      if (!team.isAdmin(currentUserId)) {
        throw new ValidationError('Only team owner or admin can add members');
      }
      
      // メンバー追加
      const updatedTeam = await this.teamRepository.addMember(teamId, userId, role);
      
      res.json(updatedTeam);
    } catch (error) {
      next(error);
    }
  }

  /**
   * チームからメンバーを削除
   */
  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId, memberId } = req.params;
      const userId = req.user.id;
      
      // チーム取得
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      
      // 権限確認
      if (!team.isAdmin(userId) && userId !== memberId) {
        throw new ValidationError('No permission to remove this member');
      }
      
      // メンバー削除
      const updatedTeam = await this.teamRepository.removeMember(teamId, memberId);
      
      res.json(updatedTeam);
    } catch (error) {
      next(error);
    }
  }

  /**
   * メンバーの役割を更新
   */
  async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId, memberId } = req.params;
      const { role } = req.body;
      const userId = req.user.id;
      
      // チーム取得
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      
      // 権限確認（オーナーまたは管理者のみ役割更新可能）
      if (!team.isAdmin(userId)) {
        throw new ValidationError('Only team owner or admin can update member roles');
      }
      
      // 役割更新
      const updatedTeam = await this.teamRepository.updateMemberRole(teamId, memberId, role);
      
      res.json(updatedTeam);
    } catch (error) {
      next(error);
    }
  }

  /**
   * チームメンバー間の相性を分析
   */
  async getTeamCompatibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const userId = req.user.id;
      
      // チーム取得
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      
      // チームメンバーかどうかを確認
      if (!team.isMember(userId)) {
        throw new NotFoundError('Team not found or access denied');
      }
      
      // チーム相性分析
      const teamAnalysis = await this.teamCompatibilityService.analyzeTeamElementalBalance(teamId);
      
      res.json(teamAnalysis);
    } catch (error) {
      next(error);
    }
  }

  /**
   * メンバー招待を送信
   */
  async inviteMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId } = req.params;
      const { email, role, message } = req.body;
      const userId = req.user.id;
      
      // チーム取得
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new NotFoundError('Team not found');
      }
      
      // 権限確認（オーナーまたは管理者のみ招待可能）
      if (!team.isAdmin(userId)) {
        throw new ValidationError('Only team owner or admin can invite members');
      }
      
      // バリデーション
      if (!email || !email.includes('@')) {
        throw new ValidationError('Valid email is required');
      }
      
      if (!role) {
        throw new ValidationError('Role is required');
      }
      
      // TODO: 実際の招待処理（メール送信など）を実装
      
      res.status(201).json({
        status: 'success',
        message: 'Invitation sent successfully',
        data: {
          teamId,
          email,
          role,
        }
      });
    } catch (error) {
      next(error);
    }
  }
}