import axios from 'axios';
import { ANALYTICS } from '../types';

// API設定をインポート
import { getApiUrl } from '../api/apiConfig';

// 分析データ型定義
interface IEngagementAnalytics {
  id: string;
  userId: string;
  period: {
    startDate: string | Date;
    endDate: string | Date;
  };
  metrics: {
    appUsage: {
      dailyFortuneViews: number;
      conversationCount: number;
      averageConversationLength: number;
      responseRate: number;
    };
    sentiment: {
      average: number;
      trend: 'improving' | 'stable' | 'declining' | 'fluctuating';
      topPositiveTopics?: string[];
      topNegativeTopics?: string[];
    };
    goals: {
      active: number;
      completed: number;
      progressRate: number;
    };
    teamEngagement?: {
      contributionCount: number;
      mentorshipActivity: number;
      peerRecognition: number;
    };
  };
}

interface ITeamAnalytics {
  id: string;
  period: {
    startDate: string | Date;
    endDate: string | Date;
  };
  overallEngagement: number;
  responseRate: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topConcerns: Array<{
    topic: string;
    frequency: number;
    averageSentiment: number;
  }>;
  topStrengths: Array<{
    topic: string;
    frequency: number;
    averageSentiment: number;
  }>;
  followUpRecommendations: Array<{
    userId: string;
    urgency: 'low' | 'medium' | 'high';
    reason: string;
    suggestedApproach?: string;
  }>;
}

/**
 * 分析データ取得サービス
 * バックエンドから経営者ダッシュボードに必要なデータを取得する
 */
class AnalyticsService {
  /**
   * 指定されたユーザーのエンゲージメント分析を取得
   * @param userId ユーザーID
   * @param startDate 開始日(省略時は過去30日)
   * @param endDate 終了日(省略時は現在日)
   */
  async getUserEngagement(userId: string, startDate?: string, endDate?: string): Promise<IEngagementAnalytics> {
    try {
      let url = ANALYTICS.GET_USER_ENGAGEMENT(userId);
      const params: any = {};
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await axios.get(getApiUrl(url), { params });
      return response.data;
    } catch (error) {
      console.error('ユーザーエンゲージメント取得エラー:', error);
      throw error;
    }
  }

  /**
   * チーム全体の分析データを取得
   * @param startDate 開始日(省略時は過去30日)
   * @param endDate 終了日(省略時は現在日)
   */
  async getTeamAnalytics(startDate?: string, endDate?: string): Promise<ITeamAnalytics> {
    try {
      const params: any = {};
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      try {
        // APIが実装されていないため、モックデータを返す
        // 実際のバックエンドが実装されたらこのコードを削除
        console.log('モックデータを使用します。本番環境ではバックエンドAPIを使用してください。');
        
        // モックデータ
        const mockData: ITeamAnalytics = {
          id: 'mock-team-analytics-id',
          period: {
            startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: endDate || new Date().toISOString()
          },
          overallEngagement: 78,
          responseRate: 82,
          sentimentDistribution: {
            positive: 65,
            neutral: 25,
            negative: 10
          },
          topConcerns: [
            { topic: '業務量', frequency: 12, averageSentiment: -0.7 },
            { topic: 'チーム連携', frequency: 8, averageSentiment: -0.5 },
            { topic: '報酬体系', frequency: 5, averageSentiment: -0.6 }
          ],
          topStrengths: [
            { topic: '職場環境', frequency: 15, averageSentiment: 0.8 },
            { topic: '技術サポート', frequency: 10, averageSentiment: 0.7 },
            { topic: '成長機会', frequency: 9, averageSentiment: 0.9 }
          ],
          followUpRecommendations: [
            {
              userId: '1',
              urgency: 'high',
              reason: '過去2週間で急激な満足度低下。技術習得と待遇について複数回の否定的発言あり。',
              suggestedApproach: '新しい技術トレーニングの機会について1対1でのミーティングを実施し、キャリアビジョンと待遇についての対話を行う。'
            },
            {
              userId: '2',
              urgency: 'medium',
              reason: '運勢確認頻度が低下中。対話内容からチーム内人間関係の悩みが検出されている。',
              suggestedApproach: '間接的にチーム活動への参加を促し、コミュニケーションの機会を増やす。必要に応じてメンター制度の活用を検討。'
            },
            {
              userId: '3',
              urgency: 'low',
              reason: 'スキル成長に関する不安の兆候。自己評価が低く、キャリアパスの明確さを求めている。',
              suggestedApproach: '具体的なスキル向上計画を一緒に設定し、成功体験を増やす機会を提供。組織内での将来的なポジションについて対話を行う。'
            }
          ]
        };
        
        return mockData;
      } catch (apiError) {
        console.error('APIのモックデータ作成エラー:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('チーム分析取得エラー:', error);
      throw error;
    }
  }

  /**
   * フォローアップが必要なスタッフの推奨リストを取得
   */
  async getFollowUpRecommendations(): Promise<ITeamAnalytics['followUpRecommendations']> {
    try {
      const response = await axios.get(getApiUrl(ANALYTICS.GET_FOLLOW_UP_RECOMMENDATIONS));
      return response.data;
    } catch (error) {
      console.error('フォローアップ推奨取得エラー:', error);
      throw error;
    }
  }

  /**
   * 感情分析のトレンドデータを取得
   */
  async getSentimentTrend(startDate?: string, endDate?: string, userId?: string): Promise<any> {
    try {
      const params: any = {};
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (userId) params.userId = userId;
      
      const response = await axios.get(getApiUrl(ANALYTICS.GET_SENTIMENT_TREND), { params });
      return response.data;
    } catch (error) {
      console.error('感情分析トレンド取得エラー:', error);
      throw error;
    }
  }

  /**
   * 目標達成率データを取得
   */
  async getGoalCompletionRate(): Promise<any> {
    try {
      const response = await axios.get(getApiUrl(ANALYTICS.GET_GOAL_COMPLETION_RATE));
      return response.data;
    } catch (error) {
      console.error('目標達成率取得エラー:', error);
      throw error;
    }
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;