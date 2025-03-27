/**
 * チームコントローラー
 * チーム関連のAPIリクエストを処理
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../utils/error.util';
import team2Service from '../../services/team2.service';
import { InvitationRole } from '@shared';

/**
 * チームコントローラークラス
 * チーム関連のすべてのAPIエンドポイントを管理
 */
export class Team2Controller {
  /**
   * 新しいチームを作成
   * @route POST /api/v1/teams
   */
  static async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      const ownerId = req.user?._id;

      if (!name) {
        throw new CustomError('チーム名は必須です', 400);
      }

      const teamData = {
        name,
        description,
        ownerId: ownerId.toString(),
        admins: [],
        members: []
      };

      const team = await team2Service.createTeam(teamData);

      res.status(201).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 全チームを取得
   * @route GET /api/v1/teams
   */
  static async getAllTeams(req: Request, res: Response, next: NextFunction) {
    try {
      // スーパー管理者の場合は全チームを取得
      // それ以外のユーザーは所属チームのみ取得
      const userId = req.user?._id.toString();
      const isSuperAdmin = req.user?.role === 'superadmin';

      const teams = isSuperAdmin
        ? await team2Service.getAllTeams()
        : await team2Service.getTeamsByUserId(userId);

      res.status(200).json({
        success: true,
        data: teams
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 特定のチームを取得
   * @route GET /api/v1/teams/:teamId
   */
  static async getTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const team = await team2Service.getTeamById(teamId);

      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * チーム情報を更新
   * @route PUT /api/v1/teams/:teamId
   */
  static async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const { name, description, isActive } = req.body;

      const updateData = {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      };

      const team = await team2Service.updateTeam(teamId, updateData);

      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * チームを削除（論理削除）
   * @route DELETE /api/v1/teams/:teamId
   */
  static async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const result = await team2Service.deleteTeam(teamId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * チームにメンバーを追加
   * @route POST /api/v1/teams/:teamId/members
   */
  static async addTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const { userId, role } = req.body;

      if (!userId) {
        throw new CustomError('ユーザーIDは必須です', 400);
      }

      if (!role || !['admin', 'member'].includes(role)) {
        throw new CustomError('ロールは「admin」または「member」のいずれかを指定してください', 400);
      }

      const team = await team2Service.addTeamMember(teamId, userId, role as 'admin' | 'member');

      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * チームからメンバーを削除
   * @route DELETE /api/v1/teams/:teamId/members/:userId
   */
  static async removeTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, userId } = req.params;
      const team = await team2Service.removeTeamMember(teamId, userId);

      res.status(200).json({
        success: true,
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * チームへの招待を作成
   * @route POST /api/v1/teams/invitations
   */
  static async createInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, teamId, role, expirationDays } = req.body;
      const inviterId = req.user?._id.toString();

      if (!email || !teamId || !role) {
        throw new CustomError('メールアドレス、チームID、ロールは必須です', 400);
      }

      if (!Object.values(InvitationRole).includes(role as InvitationRole)) {
        throw new CustomError('ロールは「admin」または「manager」または「employee」のいずれかを指定してください', 400);
      }

      const result = await team2Service.createInvitation({
        email,
        teamId,
        inviterId,
        role: role as InvitationRole,
        expirationDays
      });

      res.status(201).json({
        success: true,
        data: {
          invitation: result.invitation,
          invitationUrl: result.invitationUrl
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * チームの招待リストを取得
   * @route GET /api/v1/teams/:teamId/invitations
   */
  static async getTeamInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const invitations = await team2Service.getTeamInvitations(teamId);

      res.status(200).json({
        success: true,
        data: invitations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 招待トークンで招待情報を取得
   * @route GET /api/v1/teams/invitations/:token
   */
  static async getInvitationByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const result = await team2Service.getInvitationByToken(token);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 招待を承諾
   * @route POST /api/v1/teams/invitations/:token/accept
   */
  static async acceptInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const userId = req.user?._id.toString();

      const result = await team2Service.acceptInvitation(token, userId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          team: result.team
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 招待を拒否
   * @route POST /api/v1/teams/invitations/:token/decline
   */
  static async declineInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const result = await team2Service.declineInvitation(token);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 招待をキャンセル
   * @route DELETE /api/v1/teams/invitations/:invitationId
   */
  static async cancelInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { invitationId } = req.params;
      const result = await team2Service.cancelInvitation(invitationId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 招待を再送信
   * @route POST /api/v1/teams/invitations/:invitationId/resend
   */
  static async resendInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { invitationId } = req.params;
      const { expirationDays } = req.body;
      
      const result = await team2Service.resendInvitation(invitationId, expirationDays);

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          invitationUrl: result.invitationUrl
        }
      });
    } catch (error) {
      next(error);
    }
  }
}