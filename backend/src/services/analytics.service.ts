import { EngagementAnalytics, TeamAnalytics } from '../models/analytics.model';
import User from '../models/user.model';
import { ITeamAnalytics, IEngagementAnalytics, FortuneQueryRequest } from '@shared';
import { engagementAnalyticsDocumentToInterface, teamAnalyticsDocumentToInterface, documentToInterface } from '../utils/model-converters';

/**
 * 分析サービス
 * ユーザーエンゲージメントとチーム分析のデータを提供
 */
class AnalyticsService {
  /**
   * 指定されたユーザーのエンゲージメント分析を取得
   * @param userId ユーザーID
   * @param startDate 開始日(省略時は過去30日)
   * @param endDate 終了日(省略時は現在日)
   */
  async getUserEngagement(userId: string, startDate?: Date, endDate?: Date): Promise<IEngagementAnalytics> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // デフォルトは過去30日
    
    // ユーザーの存在確認
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    // 分析データを取得（存在しない場合はデフォルト値で新規作成）
    let analytics = await EngagementAnalytics.findOne({
      userId,
      'period.startDate': { $lte: start },
      'period.endDate': { $gte: end },
    });

    // 実際のプロダクションではここで計算ロジックを実装
    // デモ/開発用にダミーデータを生成
    if (!analytics) {
      analytics = await this.generateDummyUserEngagement(userId, start, end);
    }

    return engagementAnalyticsDocumentToInterface(analytics);
  }

  /**
   * チーム全体の分析データを取得
   * @param startDate 開始日(省略時は過去30日)
   * @param endDate 終了日(省略時は現在日)
   */
  async getTeamAnalytics(startDate?: Date, endDate?: Date): Promise<ITeamAnalytics> {
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // デフォルトは過去30日

    // 分析データを取得
    let teamAnalytics = await TeamAnalytics.findOne({
      'period.startDate': { $lte: start },
      'period.endDate': { $gte: end },
    });

    // 実際のプロダクションではここで計算ロジックを実装
    // デモ/開発用にダミーデータを生成
    if (!teamAnalytics) {
      teamAnalytics = await this.generateDummyTeamAnalytics(start, end);
    }

    return teamAnalyticsDocumentToInterface(teamAnalytics);
  }

  /**
   * フォローアップが必要なスタッフの推奨リストを取得
   */
  async getFollowUpRecommendations(): Promise<ITeamAnalytics['followUpRecommendations']> {
    const teamAnalytics = await this.getTeamAnalytics();
    return teamAnalytics.followUpRecommendations;
  }

  /**
   * 感情分析のトレンドデータを取得
   */
  async getSentimentTrend(query: FortuneQueryRequest = {}): Promise<any> {
    // 実際のプロダクションではここで計算ロジックを実装
    // デモ/開発用にダミーデータを生成
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    const trendData = {
      labels: [] as string[],
      datasets: [
        {
          label: '平均感情スコア',
          data: [] as number[],
          borderColor: '#f50057',
          fill: false,
        },
      ],
    };

    // 90日間のダミーデータを生成
    const dayDiff = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const interval = Math.max(1, Math.floor(dayDiff / 30)); // 最大30ポイント表示

    for (let i = 0; i < dayDiff; i += interval) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      trendData.labels.push(dateString);
      
      // 乱数で-0.3〜0.7の範囲のセンチメントスコアを生成
      const baseScore = 0.2; // やや肯定的なベースライン
      const variation = 0.5; // 変動幅
      const sentiment = baseScore + (Math.random() * variation - variation / 2);
      trendData.datasets[0].data.push(Number(sentiment.toFixed(2)));
    }

    return trendData;
  }

  /**
   * 目標達成率データを取得
   */
  async getGoalCompletionRate(): Promise<any> {
    // 実際のプロダクションではここで計算ロジックを実装
    // デモ/開発用にダミーデータを生成
    return {
      completionRate: 68, // パーセンテージ
      totalGoals: 25,
      completedGoals: 17,
      breakdown: {
        skill: { total: 10, completed: 7 },
        career: { total: 6, completed: 4 },
        personal: { total: 5, completed: 3 },
        team: { total: 4, completed: 3 },
      },
      trending: 'improving', // 'improving', 'stable', 'declining'
    };
  }

  /**
   * 開発用: ダミーのユーザーエンゲージメントデータを生成
   */
  private async generateDummyUserEngagement(userId: string, startDate: Date, endDate: Date): Promise<any> {
    const analytics = new EngagementAnalytics({
      userId,
      period: {
        startDate,
        endDate,
      },
      metrics: {
        appUsage: {
          dailyFortuneViews: Math.floor(Math.random() * 25) + 5,
          conversationCount: Math.floor(Math.random() * 30) + 10,
          averageConversationLength: Math.floor(Math.random() * 10) + 3,
          responseRate: Number((Math.random() * 0.4 + 0.6).toFixed(2)), // 0.6〜1.0
        },
        sentiment: {
          average: Number((Math.random() * 1.4 - 0.4).toFixed(2)), // -0.4〜1.0
          trend: ['improving', 'stable', 'declining', 'fluctuating'][Math.floor(Math.random() * 4)],
          topPositiveTopics: [
            'チーム協力', 'スキル向上', '技術習得', '顧客満足', 'サロン環境',
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          topNegativeTopics: [
            'スケジュール管理', '業務量', '待遇', 'コミュニケーション', 'ストレス',
          ].slice(0, Math.floor(Math.random() * 3) + 1),
        },
        goals: {
          active: Math.floor(Math.random() * 5) + 1,
          completed: Math.floor(Math.random() * 8) + 2,
          progressRate: Number((Math.random() * 0.6 + 0.2).toFixed(2)), // 0.2〜0.8
        },
        teamEngagement: {
          contributionCount: Math.floor(Math.random() * 10) + 1,
          mentorshipActivity: Math.floor(Math.random() * 5),
          peerRecognition: Math.floor(Math.random() * 8),
        },
      },
    });

    return await analytics.save();
  }

  /**
   * 開発用: ダミーのチーム分析データを生成
   */
  private async generateDummyTeamAnalytics(startDate: Date, endDate: Date): Promise<any> {
    // テスト用にユーザーIDs取得（本番ではデータに基づいて計算）
    const users = await User.find().select('_id').limit(10);
    // ユーザーが見つからない場合は空の配列
    const userIds = users.length > 0 ? users.map(user => user._id) : [];
    
    // フォローアップ推奨用のデータ
    let followUpRecommendations = [];
    
    // ユーザーが存在するかチェック
    if (userIds.length >= 3) {
      // 十分なユーザーIDがある場合
      followUpRecommendations = [
        {
          userId: userIds[0],
          urgency: 'high',
          reason: '過去2週間で急激な満足度低下。技術習得と待遇について複数回の否定的発言あり。',
          suggestedApproach: '新しい技術トレーニングの機会について1対1でのミーティングを実施し、キャリアビジョンと待遇についての対話を行う。',
        },
        {
          userId: userIds[1],
          urgency: 'medium',
          reason: '運勢確認頻度が低下中。対話内容からチーム内人間関係の悩みが検出されている。',
          suggestedApproach: '間接的にチーム活動への参加を促し、コミュニケーションの機会を増やす。必要に応じてメンター制度の活用を検討。',
        },
        {
          userId: userIds[2],
          urgency: 'low',
          reason: 'スキル成長に関する不安の兆候。自己評価が低く、キャリアパスの明確さを求めている。',
          suggestedApproach: '具体的なスキル向上計画を一緒に設定し、成功体験を増やす機会を提供。組織内での将来的なポジションについて対話を行う。',
        },
      ];
    } else if (userIds.length > 0) {
      // 少なくとも1人のユーザーが存在する場合、同じユーザーIDを繰り返し使用
      followUpRecommendations = [
        {
          userId: userIds[0],
          urgency: 'high',
          reason: '過去2週間で急激な満足度低下。技術習得と待遇について複数回の否定的発言あり。',
          suggestedApproach: '新しい技術トレーニングの機会について1対1でのミーティングを実施し、キャリアビジョンと待遇についての対話を行う。',
        }
      ];
      
      // 2人目と3人目のレコメンデーションを追加（もし必要なら）
      if (userIds.length > 1) {
        followUpRecommendations.push({
          userId: userIds[1],
          urgency: 'medium',
          reason: '運勢確認頻度が低下中。対話内容からチーム内人間関係の悩みが検出されている。',
          suggestedApproach: '間接的にチーム活動への参加を促し、コミュニケーションの機会を増やす。必要に応じてメンター制度の活用を検討。',
        });
      } else {
        followUpRecommendations.push({
          userId: userIds[0], // 同じユーザーを再利用
          urgency: 'medium',
          reason: '運勢確認頻度が低下中。対話内容からチーム内人間関係の悩みが検出されている。',
          suggestedApproach: '間接的にチーム活動への参加を促し、コミュニケーションの機会を増やす。必要に応じてメンター制度の活用を検討。',
        });
      }
      
      // 3人目のレコメンデーション
      followUpRecommendations.push({
        userId: userIds[0], // 同じユーザーを再利用
        urgency: 'low',
        reason: 'スキル成長に関する不安の兆候。自己評価が低く、キャリアパスの明確さを求めている。',
        suggestedApproach: '具体的なスキル向上計画を一緒に設定し、成功体験を増やす機会を提供。組織内での将来的なポジションについて対話を行う。',
      });
    }
    
    const teamAnalytics = new TeamAnalytics({
      period: {
        startDate,
        endDate,
      },
      overallEngagement: Math.floor(Math.random() * 30) + 70, // 70-100
      responseRate: Math.floor(Math.random() * 25) + 75, // 75-100
      sentimentDistribution: {
        positive: Math.floor(Math.random() * 20) + 50, // 50-70
        neutral: Math.floor(Math.random() * 20) + 20, // 20-40
        negative: Math.floor(Math.random() * 10) + 5, // 5-15
      },
      topConcerns: [
        {
          topic: '業務量と時間管理',
          frequency: Math.floor(Math.random() * 10) + 15,
          averageSentiment: Number((-0.2 - Math.random() * 0.6).toFixed(2)), // -0.2〜-0.8
        },
        {
          topic: 'キャリア成長の機会',
          frequency: Math.floor(Math.random() * 10) + 12,
          averageSentiment: Number((-0.1 - Math.random() * 0.5).toFixed(2)), // -0.1〜-0.6
        },
        {
          topic: '技術向上のサポート',
          frequency: Math.floor(Math.random() * 8) + 10,
          averageSentiment: Number((-0.1 - Math.random() * 0.4).toFixed(2)), // -0.1〜-0.5
        },
      ],
      topStrengths: [
        {
          topic: 'チームの雰囲気',
          frequency: Math.floor(Math.random() * 10) + 20,
          averageSentiment: Number((0.5 + Math.random() * 0.5).toFixed(2)), // 0.5〜1.0
        },
        {
          topic: '顧客満足度',
          frequency: Math.floor(Math.random() * 10) + 18,
          averageSentiment: Number((0.4 + Math.random() * 0.6).toFixed(2)), // 0.4〜1.0
        },
        {
          topic: 'サロン環境',
          frequency: Math.floor(Math.random() * 8) + 15,
          averageSentiment: Number((0.3 + Math.random() * 0.7).toFixed(2)), // 0.3〜1.0
        },
      ],
      followUpRecommendations: followUpRecommendations,
    });

    return await teamAnalytics.save();
  }
}

export default new AnalyticsService();