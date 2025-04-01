/**
 * チーム管理サービス
 * チーム・招待機能に関するAPIとの通信を管理
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import axios from 'axios';
import { TEAM } from '../types/paths';
import { ITeam } from '../utils/sharedTypes';
import { InvitationRole } from '../types/models';

// API設定をインポート
import { getApiUrl } from '../api/apiConfig';

// チーム作成リクエスト型
interface TeamCreateRequest {
  name: string;
  description?: string;
}

// チーム更新リクエスト型
interface TeamUpdateRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// メンバー追加リクエスト型
interface TeamMemberAddRequest {
  userId: string;
  role: 'admin' | 'member';
}

// 招待作成リクエスト型
interface InvitationCreateRequest {
  email: string;
  teamId: string;
  role: InvitationRole;
  expirationDays?: number;
}

/**
 * チーム管理サービス
 */
class Team2Service {
  /**
   * 認証トークンを取得するヘルパーメソッド
   */
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  /**
   * 新しいチームを作成
   * @param teamData チーム作成データ
   * @returns 作成されたチーム
   */
  async createTeam(teamData: TeamCreateRequest): Promise<ITeam> {
    try {
      const response = await axios.post(
        getApiUrl(TEAM.CREATE),
        teamData,
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      console.error('チーム作成エラー:', error);
      throw error;
    }
  }

  /**
   * 全てのチームを取得
   * @returns チームリスト
   */
  async getAllTeams(): Promise<ITeam[]> {
    try {
      const response = await axios.get(
        getApiUrl(TEAM.GET_ALL),
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      console.error('チーム取得エラー:', error);
      throw error;
    }
  }

  /**
   * 特定のチームを取得
   * @param teamId チームID
   * @returns チーム情報
   */
  async getTeamById(teamId: string): Promise<ITeam> {
    try {
      const response = await axios.get(
        getApiUrl(TEAM.GET_BY_ID(teamId)),
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      console.error('チーム取得エラー:', error);
      throw error;
    }
  }

  /**
   * チームを更新
   * @param teamId チームID
   * @param updateData 更新データ
   * @returns 更新されたチーム
   */
  async updateTeam(teamId: string, updateData: TeamUpdateRequest): Promise<ITeam> {
    try {
      const response = await axios.put(
        getApiUrl(TEAM.UPDATE(teamId)),
        updateData,
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      console.error('チーム更新エラー:', error);
      throw error;
    }
  }

  /**
   * チームを削除
   * @param teamId チームID
   * @returns 削除結果
   */
  async deleteTeam(teamId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(
        getApiUrl(TEAM.DELETE(teamId)),
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('チーム削除エラー:', error);
      throw error;
    }
  }

  /**
   * チームにメンバーを追加
   * @param teamId チームID
   * @param memberData メンバー追加データ
   * @returns 更新されたチーム
   */
  async addTeamMember(teamId: string, memberData: TeamMemberAddRequest): Promise<ITeam> {
    try {
      const response = await axios.post(
        getApiUrl(TEAM.ADD_MEMBER(teamId)),
        memberData,
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      console.error('チームメンバー追加エラー:', error);
      throw error;
    }
  }

  /**
   * チームからメンバーを削除
   * @param teamId チームID
   * @param userId 削除するユーザーID
   * @returns 更新されたチーム
   */
  async removeTeamMember(teamId: string, userId: string): Promise<ITeam> {
    try {
      const response = await axios.delete(
        getApiUrl(TEAM.REMOVE_MEMBER(teamId, userId)),
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      console.error('チームメンバー削除エラー:', error);
      throw error;
    }
  }

  /**
   * チームへの招待を作成
   * @param invitationData 招待データ
   * @returns 招待情報
   */
  async createInvitation(invitationData: InvitationCreateRequest): Promise<any> {
    try {
      const response = await axios.post(
        getApiUrl(TEAM.INVITE),
        invitationData,
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      console.error('招待作成エラー:', error);
      throw error;
    }
  }

  /**
   * チームの招待リストを取得
   * @param teamId チームID
   * @returns 招待リスト
   */
  async getTeamInvitations(teamId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        getApiUrl(TEAM.GET_INVITATIONS(teamId)),
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      console.error('招待リスト取得エラー:', error);
      throw error;
    }
  }

  /**
   * 招待トークンで招待情報を取得
   * @param token 招待トークン
   * @returns 招待情報
   */
  async getInvitationByToken(token: string): Promise<any> {
    try {
      const response = await axios.get(
        getApiUrl(TEAM.ACCEPT_INVITATION(token).replace('/accept', '')),
        this.getAuthHeader()
      );
      return response.data.data;
    } catch (error) {
      console.error('招待情報取得エラー:', error);
      throw error;
    }
  }

  /**
   * 招待を承諾
   * @param token 招待トークン
   * @returns 処理結果
   */
  async acceptInvitation(token: string): Promise<any> {
    try {
      const response = await axios.post(
        getApiUrl(TEAM.ACCEPT_INVITATION(token)),
        {},
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('招待承諾エラー:', error);
      throw error;
    }
  }

  /**
   * 招待を拒否
   * @param token 招待トークン
   * @returns 処理結果
   */
  async declineInvitation(token: string): Promise<any> {
    try {
      const response = await axios.post(
        getApiUrl(TEAM.DECLINE_INVITATION(token)),
        {},
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('招待拒否エラー:', error);
      throw error;
    }
  }

  /**
   * 招待をキャンセル
   * @param invitationId 招待ID
   * @returns 処理結果
   */
  async cancelInvitation(invitationId: string): Promise<any> {
    try {
      const response = await axios.delete(
        getApiUrl(TEAM.CANCEL_INVITATION(invitationId)),
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('招待キャンセルエラー:', error);
      throw error;
    }
  }

  /**
   * 招待を再送信
   * @param invitationId 招待ID
   * @param expirationDays 有効期限（日数）
   * @returns 処理結果
   */
  async resendInvitation(invitationId: string, expirationDays?: number): Promise<any> {
    try {
      const response = await axios.post(
        getApiUrl(TEAM.RESEND_INVITATION(invitationId)),
        { expirationDays },
        this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('招待再送信エラー:', error);
      throw error;
    }
  }
}

const team2Service = new Team2Service();
export default team2Service;