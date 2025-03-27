import axios from 'axios';
import { ANALYTICS } from '../types';

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
      
      const response = await axios.get(url, { params });
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
      
      const response = await axios.get(ANALYTICS.GET_TEAM_ANALYTICS, { params });
      return response.data;
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
      const response = await axios.get(ANALYTICS.GET_FOLLOW_UP_RECOMMENDATIONS);
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
      
      const response = await axios.get(ANALYTICS.GET_SENTIMENT_TREND, { params });
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
      const response = await axios.get(ANALYTICS.GET_GOAL_COMPLETION_RATE);
      return response.data;
    } catch (error) {
      console.error('目標達成率取得エラー:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();