import analyticsService from './analytics.service';
import axios from 'axios';
// @ts-ignore: axiosのバージョン互換性の問題を回避
import MockAdapter from 'axios-mock-adapter';
import { ANALYTICS } from '../types';

describe('Analytics Service', () => {
  const mock = new MockAdapter(axios);
  const userId = '12345';
  
  beforeEach(() => {
    mock.reset();
  });
  
  afterAll(() => {
    mock.restore();
  });
  
  describe('getUserEngagement', () => {
    it('should fetch user engagement data successfully', async () => {
      const mockData = {
        id: 'engagement-id',
        userId: userId,
        period: {
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        },
        metrics: {
          appUsage: {
            dailyFortuneViews: 25,
            conversationCount: 30,
            averageConversationLength: 8,
            responseRate: 0.85
          },
          sentiment: {
            average: 0.7,
            trend: 'improving',
            topPositiveTopics: ['技術習得', 'チーム協力'],
            topNegativeTopics: ['スケジュール管理']
          },
          goals: {
            active: 3,
            completed: 5,
            progressRate: 0.65
          }
        }
      };
      
      mock.onGet(ANALYTICS.GET_USER_ENGAGEMENT(userId)).reply(200, mockData);
      
      const result = await analyticsService.getUserEngagement(userId);
      expect(result).toEqual(mockData);
    });
    
    it('should handle error when fetching user engagement', async () => {
      mock.onGet(ANALYTICS.GET_USER_ENGAGEMENT(userId)).reply(500, { message: 'Server error' });
      
      await expect(analyticsService.getUserEngagement(userId)).rejects.toThrow();
    });
  });
  
  describe('getTeamAnalytics', () => {
    it('should fetch team analytics data successfully', async () => {
      const mockData = {
        id: 'team-analytics-id',
        period: {
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        },
        overallEngagement: 85,
        responseRate: 92,
        sentimentDistribution: {
          positive: 65,
          neutral: 25,
          negative: 10
        },
        topConcerns: [
          {
            topic: '業務量と時間管理',
            frequency: 18,
            averageSentiment: -0.4
          }
        ],
        topStrengths: [
          {
            topic: 'チームの雰囲気',
            frequency: 25,
            averageSentiment: 0.8
          }
        ],
        followUpRecommendations: [
          {
            userId: '1',
            urgency: 'high',
            reason: '過去2週間で急激な満足度低下'
          }
        ]
      };
      
      mock.onGet(ANALYTICS.GET_TEAM_ANALYTICS).reply(200, mockData);
      
      const result = await analyticsService.getTeamAnalytics();
      expect(result).toEqual(mockData);
    });
    
    it('should add query parameters when date range is specified', async () => {
      const mockData = { id: 'team-analytics-id', period: { startDate: '2025-01-01', endDate: '2025-01-31' } };
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';
      
      mock.onGet(ANALYTICS.GET_TEAM_ANALYTICS, { params: { startDate, endDate } }).reply(200, mockData);
      
      const result = await analyticsService.getTeamAnalytics(startDate, endDate);
      expect(result).toEqual(mockData);
    });
  });
  
  describe('getFollowUpRecommendations', () => {
    it('should fetch follow-up recommendations successfully', async () => {
      const mockData = [
        {
          userId: '1',
          urgency: 'high',
          reason: '過去2週間で急激な満足度低下'
        }
      ];
      
      mock.onGet(ANALYTICS.GET_FOLLOW_UP_RECOMMENDATIONS).reply(200, mockData);
      
      const result = await analyticsService.getFollowUpRecommendations();
      expect(result).toEqual(mockData);
    });
  });
  
  describe('getSentimentTrend', () => {
    it('should fetch sentiment trend data successfully', async () => {
      const mockData = {
        labels: ['2025-01-01', '2025-01-08', '2025-01-15', '2025-01-22', '2025-01-29'],
        datasets: [
          {
            label: '平均感情スコア',
            data: [0.2, 0.3, 0.1, 0.4, 0.5],
            borderColor: '#f50057',
            fill: false
          }
        ]
      };
      
      mock.onGet(ANALYTICS.GET_SENTIMENT_TREND).reply(200, mockData);
      
      const result = await analyticsService.getSentimentTrend();
      expect(result).toEqual(mockData);
    });
    
    it('should add query parameters when filters are specified', async () => {
      const mockData = { labels: [], datasets: [] };
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';
      const userId = '12345';
      
      mock.onGet(ANALYTICS.GET_SENTIMENT_TREND, { 
        params: { startDate, endDate, userId } 
      }).reply(200, mockData);
      
      const result = await analyticsService.getSentimentTrend(startDate, endDate, userId);
      expect(result).toEqual(mockData);
    });
  });
  
  describe('getGoalCompletionRate', () => {
    it('should fetch goal completion rate data successfully', async () => {
      const mockData = {
        completionRate: 68,
        totalGoals: 25,
        completedGoals: 17,
        breakdown: {
          skill: { total: 10, completed: 7 },
          career: { total: 6, completed: 4 },
          personal: { total: 5, completed: 3 },
          team: { total: 4, completed: 3 }
        },
        trending: 'improving'
      };
      
      mock.onGet(ANALYTICS.GET_GOAL_COMPLETION_RATE).reply(200, mockData);
      
      const result = await analyticsService.getGoalCompletionRate();
      expect(result).toEqual(mockData);
    });
  });
});