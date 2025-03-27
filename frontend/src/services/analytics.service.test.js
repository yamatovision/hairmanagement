import axios from 'axios';
import analyticsService from './analytics.service';
import { ANALYTICS } from '../types';

// Axiosのモック化
jest.mock('axios');

describe('AnalyticsService', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTeamAnalytics', () => {
    test('パラメータなしで正しくAPIを呼び出すこと', async () => {
      // モックの戻り値を設定
      const mockResponse = {
        data: {
          overallEngagement: 85,
          responseRate: 80,
          // ...その他のフィールド
        },
      };
      axios.get.mockResolvedValue(mockResponse);

      // サービスメソッドを呼び出し
      const result = await analyticsService.getTeamAnalytics();

      // 期待通りの結果が返されることを確認
      expect(result).toEqual(mockResponse.data);

      // 正しいURLでAPIが呼ばれていることを確認
      expect(axios.get).toHaveBeenCalledWith(ANALYTICS.GET_TEAM_ANALYTICS, { params: {} });
    });

    test('日付パラメータ付きで正しくAPIを呼び出すこと', async () => {
      // モックの戻り値を設定
      const mockResponse = {
        data: {
          overallEngagement: 85,
          responseRate: 80,
          // ...その他のフィールド
        },
      };
      axios.get.mockResolvedValue(mockResponse);

      const startDate = '2023-01-01';
      const endDate = '2023-03-31';

      // サービスメソッドを呼び出し
      const result = await analyticsService.getTeamAnalytics(startDate, endDate);

      // 期待通りの結果が返されることを確認
      expect(result).toEqual(mockResponse.data);

      // 正しいURLとパラメータでAPIが呼ばれていることを確認
      expect(axios.get).toHaveBeenCalledWith(
        ANALYTICS.GET_TEAM_ANALYTICS,
        { params: { startDate, endDate } }
      );
    });

    test('エラー時に適切に例外を投げること', async () => {
      // エラーを投げるようにモック
      const errorMessage = 'API error';
      axios.get.mockRejectedValue(new Error(errorMessage));

      // サービスメソッド呼び出しで例外が投げられることを確認
      await expect(analyticsService.getTeamAnalytics()).rejects.toThrow();
    });
  });

  describe('getUserEngagement', () => {
    test('必須パラメータとオプションパラメータで正しくAPIを呼び出すこと', async () => {
      // モックの戻り値を設定
      const mockResponse = {
        data: {
          userId: '1',
          metrics: {
            // ...メトリックフィールド
          },
        },
      };
      axios.get.mockResolvedValue(mockResponse);

      const userId = '1';
      const startDate = '2023-01-01';
      const endDate = '2023-03-31';

      // サービスメソッドを呼び出し
      const result = await analyticsService.getUserEngagement(userId, startDate, endDate);

      // 期待通りの結果が返されることを確認
      expect(result).toEqual(mockResponse.data);

      // 正しいURLとパラメータでAPIが呼ばれていることを確認
      expect(axios.get).toHaveBeenCalledWith(
        ANALYTICS.GET_USER_ENGAGEMENT(userId),
        { params: { startDate, endDate } }
      );
    });
  });

  describe('getFollowUpRecommendations', () => {
    test('正しくAPIを呼び出すこと', async () => {
      // モックの戻り値を設定
      const mockResponse = {
        data: [
          {
            userId: '1',
            urgency: 'high',
            reason: 'テスト理由',
          },
          // ...その他の推奨
        ],
      };
      axios.get.mockResolvedValue(mockResponse);

      // サービスメソッドを呼び出し
      const result = await analyticsService.getFollowUpRecommendations();

      // 期待通りの結果が返されることを確認
      expect(result).toEqual(mockResponse.data);

      // 正しいURLでAPIが呼ばれていることを確認
      expect(axios.get).toHaveBeenCalledWith(ANALYTICS.GET_FOLLOW_UP_RECOMMENDATIONS);
    });
  });

  describe('getSentimentTrend', () => {
    test('すべてのパラメータで正しくAPIを呼び出すこと', async () => {
      // モックの戻り値を設定
      const mockResponse = {
        data: {
          labels: ['2023-01-01', '2023-01-15'],
          datasets: [
            {
              label: '平均感情スコア',
              data: [0.5, 0.7],
            },
          ],
        },
      };
      axios.get.mockResolvedValue(mockResponse);

      const startDate = '2023-01-01';
      const endDate = '2023-03-31';
      const userId = '1';

      // サービスメソッドを呼び出し
      const result = await analyticsService.getSentimentTrend(startDate, endDate, userId);

      // 期待通りの結果が返されることを確認
      expect(result).toEqual(mockResponse.data);

      // 正しいURLとパラメータでAPIが呼ばれていることを確認
      expect(axios.get).toHaveBeenCalledWith(
        ANALYTICS.GET_SENTIMENT_TREND,
        { params: { startDate, endDate, userId } }
      );
    });
  });

  describe('getGoalCompletionRate', () => {
    test('正しくAPIを呼び出すこと', async () => {
      // モックの戻り値を設定
      const mockResponse = {
        data: {
          completionRate: 68,
          totalGoals: 25,
          completedGoals: 17,
          // ...その他のフィールド
        },
      };
      axios.get.mockResolvedValue(mockResponse);

      // サービスメソッドを呼び出し
      const result = await analyticsService.getGoalCompletionRate();

      // 期待通りの結果が返されることを確認
      expect(result).toEqual(mockResponse.data);

      // 正しいURLでAPIが呼ばれていることを確認
      expect(axios.get).toHaveBeenCalledWith(ANALYTICS.GET_GOAL_COMPLETION_RATE);
    });
  });
});