/**
 * チームサービス
 * チーム関連のビジネスロジックを管理
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import mongoose from 'mongoose';
import { IMongooseDocument } from '@shared';
import { ITeam } from '../models/team.model';
import { InvitationRole, InvitationStatus } from '../models/invitation.model';
import { CustomError } from '../utils/error.util';
import TeamModel, { ITeamDocument } from '../models/team.model';
import UserModel from '../models/user.model';
import InvitationModel from '../models/invitation.model';

// チーム作成リクエスト型
interface TeamCreateRequest {
  name: string;
  description?: string;
  ownerId: string;
  admins?: string[];
  members?: string[];
}

// チーム更新リクエスト型
interface TeamUpdateRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// 招待リクエスト型
interface InvitationRequest {
  email: string;
  teamId: string;
  inviterId: string;
  role: InvitationRole;
  expirationDays?: number;
}

/**
 * チーム関連のビジネスロジックを管理するサービス
 */
class Team2Service {
  /**
   * 新しいチームを作成
   * @param teamData チーム作成データ
   * @returns 作成されたチーム
   */
  async createTeam(teamData: TeamCreateRequest): Promise<ITeamDocument> {
    try {
      // オーナーが存在するか確認
      const ownerExists = await UserModel.findById(teamData.ownerId);
      if (!ownerExists) {
        throw new CustomError('指定されたオーナーが存在しません', 404);
      }

      // 新しいチームを作成
      const team = new TeamModel({
        name: teamData.name,
        description: teamData.description,
        ownerId: new mongoose.Types.ObjectId(teamData.ownerId),
        admins: teamData.admins?.map(id => new mongoose.Types.ObjectId(id)) || [],
        members: teamData.members?.map(id => new mongoose.Types.ObjectId(id)) || []
      });

      // チームを保存
      await team.save();

      // ユーザーのteamIdsを更新
      await UserModel.findByIdAndUpdate(
        teamData.ownerId,
        { $addToSet: { teamIds: team._id } }
      );

      // 管理者・メンバーのteamIdsも更新
      if (teamData.admins && teamData.admins.length > 0) {
        await UserModel.updateMany(
          { _id: { $in: teamData.admins } },
          { $addToSet: { teamIds: team._id } }
        );
      }

      if (teamData.members && teamData.members.length > 0) {
        await UserModel.updateMany(
          { _id: { $in: teamData.members } },
          { $addToSet: { teamIds: team._id } }
        );
      }

      return team;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('チームの作成に失敗しました', 500);
    }
  }

  /**
   * 特定のチームを取得
   * @param teamId チームID
   * @returns チーム情報
   */
  async getTeamById(teamId: string): Promise<ITeamDocument> {
    try {
      const team = await TeamModel.findById(teamId);
      if (!team) {
        throw new CustomError('チームが見つかりません', 404);
      }
      return team;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('チームの取得に失敗しました', 500);
    }
  }

  /**
   * 特定のユーザーが所属する全チームを取得
   * @param userId ユーザーID
   * @returns チームリスト
   */
  async getTeamsByUserId(userId: string): Promise<ITeamDocument[]> {
    try {
      // オーナー、管理者、メンバーのいずれかに該当するチームを検索
      const teams = await TeamModel.find({
        $or: [
          { ownerId: userId },
          { admins: userId },
          { members: userId }
        ],
        isActive: true
      }).sort({ createdAt: -1 });
      
      return teams;
    } catch (error) {
      throw new CustomError('ユーザーのチーム取得に失敗しました', 500);
    }
  }

  /**
   * 全てのチームを取得（スーパー管理者用）
   * @returns 全チームリスト
   */
  async getAllTeams(): Promise<ITeamDocument[]> {
    try {
      const teams = await TeamModel.find().sort({ createdAt: -1 });
      return teams;
    } catch (error) {
      throw new CustomError('チームの取得に失敗しました', 500);
    }
  }

  /**
   * チーム情報を更新
   * @param teamId チームID
   * @param updateData 更新データ
   * @returns 更新されたチーム
   */
  async updateTeam(teamId: string, updateData: TeamUpdateRequest): Promise<ITeamDocument> {
    try {
      const team = await TeamModel.findByIdAndUpdate(
        teamId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!team) {
        throw new CustomError('チームが見つかりません', 404);
      }

      return team;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('チームの更新に失敗しました', 500);
    }
  }

  /**
   * チームにメンバーを追加
   * @param teamId チームID
   * @param userId 追加するユーザーID
   * @param role ロール（admin または member）
   * @returns 更新されたチーム
   */
  async addTeamMember(teamId: string, userId: string, role: 'admin' | 'member'): Promise<ITeamDocument> {
    try {
      // ユーザーが存在するか確認
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new CustomError('指定されたユーザーが存在しません', 404);
      }

      // チームが存在するか確認
      const team = await TeamModel.findById(teamId);
      if (!team) {
        throw new CustomError('指定されたチームが存在しません', 404);
      }

      // 更新するフィールドを決定
      const field = role === 'admin' ? 'admins' : 'members';
      const updateQuery = { $addToSet: { [field]: new mongoose.Types.ObjectId(userId) } };

      // チームを更新
      const updatedTeam = await TeamModel.findByIdAndUpdate(
        teamId,
        updateQuery,
        { new: true }
      );

      if (!updatedTeam) {
        throw new CustomError('チームの更新に失敗しました', 500);
      }

      // ユーザーのteamIdsを更新
      await UserModel.findByIdAndUpdate(
        userId,
        { $addToSet: { teamIds: new mongoose.Types.ObjectId(teamId) } }
      );

      return updatedTeam;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('チームメンバーの追加に失敗しました', 500);
    }
  }

  /**
   * チームからメンバーを削除
   * @param teamId チームID
   * @param userId 削除するユーザーID
   * @returns 更新されたチーム
   */
  async removeTeamMember(teamId: string, userId: string): Promise<ITeamDocument> {
    try {
      // チームが存在するか確認
      const team = await TeamModel.findById(teamId);
      if (!team) {
        throw new CustomError('指定されたチームが存在しません', 404);
      }

      // オーナーは削除できない
      if (team.ownerId.toString() === userId) {
        throw new CustomError('チームオーナーは削除できません', 400);
      }

      // チームから管理者とメンバー両方から削除
      const updatedTeam = await TeamModel.findByIdAndUpdate(
        teamId,
        {
          $pull: {
            admins: new mongoose.Types.ObjectId(userId),
            members: new mongoose.Types.ObjectId(userId)
          }
        },
        { new: true }
      );

      if (!updatedTeam) {
        throw new CustomError('チームの更新に失敗しました', 500);
      }

      // ユーザーのteamIdsからこのチームを削除
      await UserModel.findByIdAndUpdate(
        userId,
        { $pull: { teamIds: new mongoose.Types.ObjectId(teamId) } }
      );

      return updatedTeam;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('チームメンバーの削除に失敗しました', 500);
    }
  }

  /**
   * チームを削除（論理削除）
   * @param teamId チームID
   * @returns 削除結果
   */
  async deleteTeam(teamId: string): Promise<{ success: boolean; message: string }> {
    try {
      // チームを論理削除（isActiveをfalseに設定）
      const result = await TeamModel.findByIdAndUpdate(
        teamId,
        { isActive: false },
        { new: true }
      );

      if (!result) {
        throw new CustomError('チームが見つかりません', 404);
      }

      return { success: true, message: 'チームを削除しました' };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('チームの削除に失敗しました', 500);
    }
  }

  /**
   * チームへの招待を作成
   * @param invitationData 招待データ
   * @returns 招待情報
   */
  async createInvitation(invitationData: InvitationRequest): Promise<any> {
    try {
      // チームが存在するか確認
      const team = await TeamModel.findById(invitationData.teamId);
      if (!team) {
        throw new CustomError('指定されたチームが存在しません', 404);
      }

      // 招待者が存在するか確認
      const inviter = await UserModel.findById(invitationData.inviterId);
      if (!inviter) {
        throw new CustomError('招待者のユーザーが存在しません', 404);
      }

      // 既存の招待をチェック
      const existingInvitation = await InvitationModel.findOne({
        email: invitationData.email.toLowerCase(),
        teamId: invitationData.teamId,
        status: InvitationStatus.PENDING
      });

      if (existingInvitation) {
        throw new CustomError('このメールアドレスへの招待が既に存在します', 400);
      }

      // 有効期限を設定（デフォルト7日）
      const expirationDays = invitationData.expirationDays || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      // 招待トークンを生成
      const invitationToken = InvitationModel.generateToken();

      // 招待を作成
      const invitation = new InvitationModel({
        email: invitationData.email.toLowerCase(),
        teamId: new mongoose.Types.ObjectId(invitationData.teamId),
        inviterId: new mongoose.Types.ObjectId(invitationData.inviterId),
        invitationToken,
        status: InvitationStatus.PENDING,
        role: invitationData.role,
        expiresAt
      });

      await invitation.save();

      // TODO: メール送信処理（実際の実装ではここでメール送信を行う）
      const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/teams/invitation/${invitationToken}`;

      return {
        invitation,
        invitationUrl
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('招待の作成に失敗しました', 500);
    }
  }

  /**
   * 招待トークンで招待を取得
   * @param token 招待トークン
   * @returns 招待情報
   */
  async getInvitationByToken(token: string): Promise<any> {
    try {
      const invitation = await InvitationModel.findOne({ invitationToken: token });
      
      if (!invitation) {
        throw new CustomError('招待が見つかりません', 404);
      }

      if (invitation.isExpired()) {
        throw new CustomError('招待の有効期限が切れています', 400);
      }

      // チーム情報を取得
      const team = await TeamModel.findById(invitation.teamId);
      if (!team) {
        throw new CustomError('関連するチームが見つかりません', 404);
      }

      return {
        invitation,
        team: {
          id: team._id,
          name: team.name,
          description: team.description
        }
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('招待の取得に失敗しました', 500);
    }
  }

  /**
   * チームの招待リストを取得
   * @param teamId チームID
   * @returns 招待リスト
   */
  async getTeamInvitations(teamId: string): Promise<any[]> {
    try {
      const invitations = await InvitationModel.find({
        teamId,
        status: InvitationStatus.PENDING,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      return invitations;
    } catch (error) {
      throw new CustomError('招待の取得に失敗しました', 500);
    }
  }

  /**
   * 招待を承諾
   * @param token 招待トークン
   * @param userId ユーザーID
   * @returns 招待処理結果
   */
  async acceptInvitation(token: string, userId: string): Promise<any> {
    try {
      // 招待を取得
      const invitation = await InvitationModel.findOne({ invitationToken: token });
      
      if (!invitation) {
        throw new CustomError('招待が見つかりません', 404);
      }

      if (invitation.isExpired()) {
        throw new CustomError('招待の有効期限が切れています', 400);
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new CustomError('この招待は既に処理されています', 400);
      }

      // ユーザーを取得
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new CustomError('ユーザーが見つかりません', 404);
      }

      // ユーザーのメールアドレスと招待のメールアドレスが一致するか確認
      if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
        throw new CustomError('招待されたメールアドレスとユーザーのメールアドレスが一致しません', 400);
      }

      // チームを取得
      const team = await TeamModel.findById(invitation.teamId);
      if (!team) {
        throw new CustomError('チームが見つかりません', 404);
      }

      // ユーザーをチームに追加
      const role = invitation.role === InvitationRole.ADMIN ? 'admin' : 'member';
      await this.addTeamMember(team._id.toString(), userId, role as 'admin' | 'member');

      // 招待ステータスを更新
      invitation.status = InvitationStatus.ACCEPTED;
      await invitation.save();

      return {
        success: true,
        message: 'チーム招待を承諾しました',
        team: {
          id: team._id,
          name: team.name
        }
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('招待の承諾に失敗しました', 500);
    }
  }

  /**
   * 招待を拒否
   * @param token 招待トークン
   * @returns 招待処理結果
   */
  async declineInvitation(token: string): Promise<any> {
    try {
      // 招待を取得
      const invitation = await InvitationModel.findOne({ invitationToken: token });
      
      if (!invitation) {
        throw new CustomError('招待が見つかりません', 404);
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new CustomError('この招待は既に処理されています', 400);
      }

      // 招待ステータスを更新
      invitation.status = InvitationStatus.DECLINED;
      await invitation.save();

      return {
        success: true,
        message: 'チーム招待を拒否しました'
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('招待の拒否に失敗しました', 500);
    }
  }

  /**
   * 招待をキャンセル
   * @param invitationId 招待ID
   * @returns 招待処理結果
   */
  async cancelInvitation(invitationId: string): Promise<any> {
    try {
      const invitation = await InvitationModel.findById(invitationId);
      
      if (!invitation) {
        throw new CustomError('招待が見つかりません', 404);
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new CustomError('この招待は既に処理されています', 400);
      }

      // 招待を削除
      await InvitationModel.findByIdAndDelete(invitationId);

      return {
        success: true,
        message: 'チーム招待をキャンセルしました'
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('招待のキャンセルに失敗しました', 500);
    }
  }

  /**
   * 招待を再送信
   * @param invitationId 招待ID
   * @param expirationDays 有効期限（日数）
   * @returns 招待処理結果
   */
  async resendInvitation(invitationId: string, expirationDays: number = 7): Promise<any> {
    try {
      const invitation = await InvitationModel.findById(invitationId);
      
      if (!invitation) {
        throw new CustomError('招待が見つかりません', 404);
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new CustomError('この招待は既に処理されています', 400);
      }

      // 有効期限を更新
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);
      
      // 新しいトークンを生成
      const invitationToken = InvitationModel.generateToken();

      // 招待を更新
      invitation.invitationToken = invitationToken;
      invitation.expiresAt = expiresAt;
      await invitation.save();

      // TODO: メール送信処理（実際の実装ではここでメール送信を行う）
      const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/teams/invitation/${invitationToken}`;

      return {
        success: true,
        message: 'チーム招待を再送信しました',
        invitationUrl
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('招待の再送信に失敗しました', 500);
    }
  }
}

export default new Team2Service();