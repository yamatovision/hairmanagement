/**
 * 経営者ダッシュボード関連エンドポイントのユニットテスト
 * 
 * 使用方法:
 * npm test -- backend/src/tests/analytics.test.js
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const analyticsController = require('../api/controllers/analytics.controller');
const analyticsService = require('../services/analytics.service');
const { mockAuthenticate, mockAuthorize } = require('./mocks/auth.mock');

// アプリケーションをモック
const app = express();
app.use(express.json());

// 認証ミドルウェアをモック
jest.mock('../api/middlewares/auth.middleware', () => ({
  authenticate: (req, res, next) => mockAuthenticate(req, res, next),
}));

jest.mock('../api/middlewares/role.middleware', () => ({
  authorize: () => (req, res, next) => mockAuthorize(req, res, next),
}));

// エンドポイント設定
app.get('/api/v1/analytics/team', analyticsController.getTeamAnalytics);
app.get('/api/v1/analytics/users/:userId/engagement', analyticsController.getUserEngagement);
app.get('/api/v1/analytics/follow-up-recommendations', analyticsController.getFollowUpRecommendations);
app.get('/api/v1/analytics/sentiment-trend', analyticsController.getSentimentTrend);
app.get('/api/v1/analytics/goal-completion-rate', analyticsController.getGoalCompletionRate);

// analyticsServiceをモック
jest.mock('../services/analytics.service');

describe('Analytics API Endpoints', () => {
  let mongoServer;
  
  beforeAll(async () => {
    // インメモリMongoDBサーバーを起動
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });
  
  describe('GET /api/v1/analytics/team', () => {
    it('チーム分析データを正常に取得できること', async () => {
      // モックの戻り値を設定
      const mockTeamData = {
        period: {
          startDate: new Date(),
          endDate: new Date(),
        },
        overallEngagement: 85,
        responseRate: 78,
        sentimentDistribution: {
          positive: 65,
          neutral: 25,
          negative: 10,
        },
        followUpRecommendations: [
          {
            userId: '1',
            urgency: 'high',
            reason: 'テスト理由',
            suggestedApproach: 'テスト提案',
          },
        ],
      };
      
      analyticsService.getTeamAnalytics.mockResolvedValue(mockTeamData);
      
      // APIリクエスト
      const response = await request(app).get('/api/v1/analytics/team');
      
      // レスポンスの検証
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTeamData);
      expect(analyticsService.getTeamAnalytics).toHaveBeenCalledTimes(1);
    });
    
    it('エラー時に適切なステータスコードとメッセージを返すこと', async () => {
      // エラーをモック
      analyticsService.getTeamAnalytics.mockRejectedValue(new Error('テストエラー'));
      
      // APIリクエスト
      const response = await request(app).get('/api/v1/analytics/team');
      
      // レスポンスの検証
      expect(response.status).toBe(500);
      expect(response.body.message).toBeTruthy();
    });
  });
  
  describe('GET /api/v1/analytics/users/:userId/engagement', () => {
    it('ユーザーエンゲージメント分析を正常に取得できること', async () => {
      // モックの戻り値を設定
      const mockUserData = {
        userId: '1',
        period: {
          startDate: new Date(),
          endDate: new Date(),
        },
        metrics: {
          appUsage: {
            dailyFortuneViews: 15,
          },
          sentiment: {
            average: 0.7,
          },
        },
      };
      
      analyticsService.getUserEngagement.mockResolvedValue(mockUserData);
      
      // APIリクエスト
      const response = await request(app).get('/api/v1/analytics/users/1/engagement');
      
      // レスポンスの検証
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserData);
      expect(analyticsService.getUserEngagement).toHaveBeenCalledWith('1', undefined, undefined);
    });
  });
  
  describe('GET /api/v1/analytics/follow-up-recommendations', () => {
    it('フォローアップ推奨を正常に取得できること', async () => {
      // モックの戻り値を設定
      const mockRecommendations = [
        {
          userId: '1',
          urgency: 'high',
          reason: 'テスト理由',
          suggestedApproach: 'テスト提案',
        },
      ];
      
      analyticsService.getFollowUpRecommendations.mockResolvedValue(mockRecommendations);
      
      // APIリクエスト
      const response = await request(app).get('/api/v1/analytics/follow-up-recommendations');
      
      // レスポンスの検証
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRecommendations);
      expect(analyticsService.getFollowUpRecommendations).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('GET /api/v1/analytics/sentiment-trend', () => {
    it('感情分析トレンドを正常に取得できること', async () => {
      // モックの戻り値を設定
      const mockTrendData = {
        labels: ['2025-01-01', '2025-01-02'],
        datasets: [
          {
            label: '平均感情スコア',
            data: [0.5, 0.7],
          },
        ],
      };
      
      analyticsService.getSentimentTrend.mockResolvedValue(mockTrendData);
      
      // APIリクエスト
      const response = await request(app).get('/api/v1/analytics/sentiment-trend');
      
      // レスポンスの検証
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTrendData);
      expect(analyticsService.getSentimentTrend).toHaveBeenCalledTimes(1);
    });
    
    it('クエリパラメータ付きで感情分析トレンドを取得できること', async () => {
      // モックの戻り値を設定
      const mockTrendData = {
        labels: ['2025-01-01', '2025-01-02'],
        datasets: [
          {
            label: '平均感情スコア',
            data: [0.5, 0.7],
          },
        ],
      };
      
      analyticsService.getSentimentTrend.mockResolvedValue(mockTrendData);
      
      // APIリクエスト（クエリパラメータ付き）
      const response = await request(app)
        .get('/api/v1/analytics/sentiment-trend')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-01-02',
          userId: '1',
        });
      
      // レスポンスの検証
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTrendData);
      expect(analyticsService.getSentimentTrend).toHaveBeenCalledWith({
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        userId: '1',
      });
    });
  });
  
  describe('GET /api/v1/analytics/goal-completion-rate', () => {
    it('目標達成率を正常に取得できること', async () => {
      // モックの戻り値を設定
      const mockGoalData = {
        completionRate: 68,
        totalGoals: 25,
        completedGoals: 17,
        breakdown: {
          skill: { total: 10, completed: 7 },
          career: { total: 6, completed: 4 },
        },
      };
      
      analyticsService.getGoalCompletionRate.mockResolvedValue(mockGoalData);
      
      // APIリクエスト
      const response = await request(app).get('/api/v1/analytics/goal-completion-rate');
      
      // レスポンスの検証
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGoalData);
      expect(analyticsService.getGoalCompletionRate).toHaveBeenCalledTimes(1);
    });
  });
});