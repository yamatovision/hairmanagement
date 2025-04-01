import axios from 'axios';
import { getApiUrl } from '../api/apiConfig';

// チーム関連のエンドポイント
const ENDPOINTS = {
  GET_TEAMS: '/teams',
  GET_TEAM: (id: string) => `/teams/${id}`,
  CREATE_TEAM: '/teams',
  UPDATE_TEAM: (id: string) => `/teams/${id}`,
  DELETE_TEAM: (id: string) => `/teams/${id}`,
  INVITE_MEMBER: (id: string) => `/teams/${id}/invite`,
  GET_TEAM_ANALYTICS: (id: string) => `/teams/${id}/analytics`,
  GET_TEAM_COMPATIBILITY: (id: string) => `/teams/${id}/compatibility`
};

// Team型定義
export interface ITeam {
  id: string;
  name: string;
  description?: string;
  goal?: string;
  isActive: boolean;
  ownerId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  admins?: string[];
  members?: Array<{
    userId: string;
    name?: string;
    email?: string;
    role: string;
    joinedAt: string | Date;
    elementalType?: {
      mainElement: string;
      yinYang: string;
    };
  }>;
}

// チーム分析データ型
export interface ITeamElementalAnalysis {
  teamId: string;
  elementDistribution: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  yinYangBalance: {
    yin: number;
    yang: number;
  };
  complementaryRelations: Array<{
    userId1: string;
    userId2: string;
    compatibilityScore: number;
    relationshipType: string;
    complementaryAreas: string[];
  }>;
  teamStrengths: string[];
  teamWeaknesses: string[];
  optimizationSuggestions: Array<{
    type: 'recruitment' | 'reassignment' | 'development';
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

// メンバー招待情報型
interface IInviteRequest {
  email: string;
  role: string;
  message?: string;
}

/**
 * チーム関連のAPIサービス
 */
class TeamService {
  /**
   * ユーザーが所属または管理するチーム一覧を取得
   */
  async getTeams() {
    try {
      const response = await axios.get(getApiUrl(ENDPOINTS.GET_TEAMS));
      return response.data;
    } catch (error) {
      console.error('チーム一覧取得エラー:', error);
      
      // モックデータ（バックエンドAPIが完成したら削除）
      return this.getMockTeams();
    }
  }

  /**
   * チーム詳細情報を取得
   */
  async getTeam(teamId: string) {
    try {
      const response = await axios.get(getApiUrl(ENDPOINTS.GET_TEAM(teamId)));
      return response.data;
    } catch (error) {
      console.error(`チーム詳細取得エラー (ID: ${teamId}):`, error);
      
      // モックデータ（バックエンドAPIが完成したら削除）
      const mockTeams = this.getMockTeams();
      return mockTeams.find(team => team.id === teamId);
    }
  }

  /**
   * 新しいチームを作成
   */
  async createTeam(teamData: Partial<ITeam>) {
    try {
      const response = await axios.post(getApiUrl(ENDPOINTS.CREATE_TEAM), teamData);
      return response.data;
    } catch (error) {
      console.error('チーム作成エラー:', error);
      throw error;
    }
  }

  /**
   * チーム情報を更新
   */
  async updateTeam(teamId: string, teamData: Partial<ITeam>) {
    try {
      const response = await axios.put(getApiUrl(ENDPOINTS.UPDATE_TEAM(teamId)), teamData);
      return response.data;
    } catch (error) {
      console.error(`チーム更新エラー (ID: ${teamId}):`, error);
      throw error;
    }
  }

  /**
   * チームを削除
   */
  async deleteTeam(teamId: string) {
    try {
      const response = await axios.delete(getApiUrl(ENDPOINTS.DELETE_TEAM(teamId)));
      return response.data;
    } catch (error) {
      console.error(`チーム削除エラー (ID: ${teamId}):`, error);
      throw error;
    }
  }

  /**
   * チームメンバーを招待
   */
  async inviteMember(teamId: string, inviteData: IInviteRequest) {
    try {
      const response = await axios.post(getApiUrl(ENDPOINTS.INVITE_MEMBER(teamId)), inviteData);
      return response.data;
    } catch (error) {
      console.error(`メンバー招待エラー (Team ID: ${teamId}):`, error);
      throw error;
    }
  }

  /**
   * チームの五行バランス分析を取得
   */
  async getTeamAnalytics(teamId: string): Promise<ITeamElementalAnalysis> {
    try {
      const response = await axios.get(getApiUrl(ENDPOINTS.GET_TEAM_ANALYTICS(teamId)));
      return response.data;
    } catch (error) {
      console.error(`チーム分析取得エラー (ID: ${teamId}):`, error);
      
      // モックデータを返す（バックエンドAPIが完成したら削除）
      return this.getMockTeamAnalytics(teamId);
    }
  }

  /**
   * チームメンバー間の相性分析を取得
   */
  async getTeamCompatibility(teamId: string) {
    try {
      const response = await axios.get(getApiUrl(ENDPOINTS.GET_TEAM_COMPATIBILITY(teamId)));
      return response.data;
    } catch (error) {
      console.error(`チーム相性分析エラー (ID: ${teamId}):`, error);
      throw error;
    }
  }

  /**
   * モックチームデータを生成（開発用）
   */
  private getMockTeams(): ITeam[] {
    return [
      {
        id: '1',
        name: 'コアプロダクトチーム',
        description: '主要プロダクト開発を担当するチーム。フロントエンドからバックエンドまで幅広く対応。',
        goal: '年内に新機能リリースと既存機能の最適化を達成する。',
        isActive: true,
        ownerId: 'owner-1',
        createdAt: '2025-01-15T00:00:00.000Z',
        updatedAt: '2025-03-28T00:00:00.000Z',
        admins: ['admin-1', 'admin-2'],
        members: [
          {
            userId: 'user-1',
            name: '田中 健太',
            email: 'tanaka@example.com',
            role: 'developer',
            joinedAt: '2025-01-15T00:00:00.000Z',
            elementalType: { mainElement: '水', yinYang: '陰' }
          },
          {
            userId: 'user-2',
            name: '松本 優子',
            email: 'matsumoto@example.com',
            role: 'designer',
            joinedAt: '2025-01-20T00:00:00.000Z',
            elementalType: { mainElement: '火', yinYang: '陽' }
          },
          {
            userId: 'user-3',
            name: '佐藤 早紀',
            email: 'sato@example.com',
            role: 'project-manager',
            joinedAt: '2025-01-25T00:00:00.000Z',
            elementalType: { mainElement: '土', yinYang: '陰' }
          }
        ]
      },
      {
        id: '2',
        name: 'マーケティングチーム',
        description: 'プロダクトのマーケティング戦略立案と実行を担当。',
        goal: '顧客獲得とブランド認知度の向上',
        isActive: true,
        ownerId: 'owner-2',
        createdAt: '2025-02-10T00:00:00.000Z',
        updatedAt: '2025-03-25T00:00:00.000Z',
        admins: ['admin-3'],
        members: [
          {
            userId: 'user-4',
            name: '鈴木 健司',
            email: 'suzuki@example.com',
            role: 'marketing-specialist',
            joinedAt: '2025-02-10T00:00:00.000Z',
            elementalType: { mainElement: '金', yinYang: '陽' }
          },
          {
            userId: 'user-5',
            name: '山本 裕子',
            email: 'yamamoto@example.com',
            role: 'content-creator',
            joinedAt: '2025-02-15T00:00:00.000Z',
            elementalType: { mainElement: '木', yinYang: '陰' }
          }
        ]
      },
      {
        id: '3',
        name: 'カスタマーサポートチーム',
        description: 'ユーザーからの問い合わせ対応と顧客満足度向上を担当。',
        goal: 'サポート対応時間の短縮と顧客満足度90%以上の達成',
        isActive: true,
        ownerId: 'owner-3',
        createdAt: '2025-02-20T00:00:00.000Z',
        updatedAt: '2025-03-20T00:00:00.000Z',
        admins: [],
        members: [
          {
            userId: 'user-6',
            name: '加藤 恵',
            email: 'kato@example.com',
            role: 'support-specialist',
            joinedAt: '2025-02-20T00:00:00.000Z',
            elementalType: { mainElement: '水', yinYang: '陰' }
          },
          {
            userId: 'user-7',
            name: '伊藤 大輔',
            email: 'ito@example.com',
            role: 'support-specialist',
            joinedAt: '2025-02-25T00:00:00.000Z',
            elementalType: { mainElement: '火', yinYang: '陽' }
          }
        ]
      }
    ];
  }

  /**
   * モックチーム分析データを生成（開発用）
   */
  private getMockTeamAnalytics(teamId: string): ITeamElementalAnalysis {
    return {
      teamId,
      elementDistribution: {
        wood: 15,
        fire: 30,
        earth: 20,
        metal: 25,
        water: 10
      },
      yinYangBalance: {
        yin: 45,
        yang: 55
      },
      complementaryRelations: [
        {
          userId1: 'user-1',
          userId2: 'user-2',
          compatibilityScore: 85,
          relationshipType: '相生',
          complementaryAreas: ['創造性', '実行力']
        },
        {
          userId1: 'user-2',
          userId2: 'user-3',
          compatibilityScore: 65,
          relationshipType: '中立',
          complementaryAreas: ['計画力', '直感力']
        },
        {
          userId1: 'user-1',
          userId2: 'user-3',
          compatibilityScore: 35,
          relationshipType: '相剋',
          complementaryAreas: ['分析力', '調整力']
        }
      ],
      teamStrengths: [
        '創造的な問題解決力',
        '実行力と行動力',
        '急速な意思決定能力'
      ],
      teamWeaknesses: [
        '長期的な視野の欠如',
        '詳細への注意不足',
        'バランスを欠いた五行構成（水が不足）'
      ],
      optimizationSuggestions: [
        {
          type: 'recruitment',
          description: '「水」属性の人材を追加し、チームの分析力と冷静さを強化する',
          priority: 'high'
        },
        {
          type: 'reassignment',
          description: '「火」と「土」の属性を持つメンバー間の協力を促進するための役割調整',
          priority: 'medium'
        },
        {
          type: 'development',
          description: '「金」属性メンバーの詳細指向能力を活かしたレビュープロセスの導入',
          priority: 'low'
        }
      ]
    };
  }
}

const teamService = new TeamService();
export default teamService;