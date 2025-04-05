/**
 * 分析APIエンドポイントのテスト - TestLABO対応版
 * 
 * 経営者ダッシュボードで使用される分析APIエンドポイントをテストします。
 * フェーズ4の一部として、APIエンドポイントが正しく動作するか検証します。
 * 
 * 使用方法:
 * node scripts/test-analytics-endpoints.js
 */

// .envファイルがあれば読み込む
require('dotenv').config();

// 必要なインポート
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { mongoose } = require('mongoose');

// TestLABOフレームワークのインポート
const TestRunner = require('../TestLABO/lib/test-runner');
const utils = require('../TestLABO/utils/test-utils');
const config = require('../TestLABO/config/test-config');

/**
 * メインテスト関数
 * 分析APIエンドポイントをテストします
 * 
 * @param {Object} context - テスト実行コンテキスト
 * @param {import('axios').AxiosInstance} context.client - 設定済みのAPIクライアント
 * @param {Object} context.logger - ロガーオブジェクト
 * @param {Function} context.recordResult - テスト結果を記録する関数
 */
async function testMain({ client, logger, recordResult }) {
  try {
    logger.info('分析APIエンドポイントのテストを開始します');
    
    // APIパスの定義
    const basePath = '/api/v1';
    const ANALYTICS = {
      GET_USER_ENGAGEMENT: (userId) => `${basePath}/analytics/users/${userId}/engagement`,
      GET_TEAM_ANALYTICS: `${basePath}/analytics/team`,
      GET_FOLLOW_UP_RECOMMENDATIONS: `${basePath}/analytics/follow-up-recommendations`,
      GET_SENTIMENT_TREND: `${basePath}/analytics/sentiment-trend`,
      GET_GOAL_COMPLETION_RATE: `${basePath}/analytics/goal-completion-rate`,
    };
    
    let token = null;
    let userId = null;
    
    // ステップ1: ログインして認証トークンを取得
    logger.info('認証トークンを取得中...');
    
    try {
      const loginResponse = await client.post(`${basePath}/auth/login`, {
        email: config.USERS.ADMIN.EMAIL || 'admin@example.com',
        password: config.USERS.ADMIN.PASSWORD || 'admin123'
      });
      
      // トークン取得を試みる
      if (loginResponse.status === 200 && loginResponse.data) {
        token = loginResponse.data.token || 
          (loginResponse.data.data && loginResponse.data.data.token);
        
        userId = (loginResponse.data.user && loginResponse.data.user.id) || 
          (loginResponse.data.data && loginResponse.data.data.user && loginResponse.data.data.user.id);
        
        logger.debug(`トークンを取得しました: ${token.substring(0, 15)}...`);
        logger.debug(`ユーザーID: ${userId}`);
        
        recordResult('ログイン認証', true, {
          success: true,
          hasToken: !!token,
          hasUserId: !!userId
        });
      } else {
        // ログイン失敗
        recordResult('ログイン認証', false, {
          status: loginResponse.status,
          data: loginResponse.data
        }, new Error('認証トークンの取得に失敗しました'));
        return;
      }
    } catch (error) {
      logger.error('ログイン認証エラー:', error);
      recordResult('ログイン認証', false, null, error);
      
      // テスト継続不可能なのでここで終了
      return;
    }
    
    // 認証済みクライアントを作成
    const authClient = utils.createApiClient(token);
    
    // ステップ2: チーム分析データの取得
    logger.info('チーム分析データをテスト中...');
    
    try {
      const teamAnalyticsResponse = await authClient.get(ANALYTICS.GET_TEAM_ANALYTICS);
      
      const success = teamAnalyticsResponse.status === 200 && 
        teamAnalyticsResponse.data && 
        teamAnalyticsResponse.data.overallEngagement !== undefined;
      
      recordResult('チーム分析データ取得', success, {
        status: teamAnalyticsResponse.status,
        hasData: !!teamAnalyticsResponse.data,
        dataStructure: teamAnalyticsResponse.data ? {
          hasOverallEngagement: teamAnalyticsResponse.data.overallEngagement !== undefined,
          hasFollowUpRecommendations: Array.isArray(teamAnalyticsResponse.data.followUpRecommendations),
          hasSentimentDistribution: !!teamAnalyticsResponse.data.sentimentDistribution,
        } : null
      });
      
      if (success) {
        logger.info('チーム分析データ取得成功');
      } else {
        logger.warn('チーム分析データの構造が期待と異なります');
      }
    } catch (error) {
      logger.error('チーム分析データ取得エラー:', error);
      
      // エラーが返された場合はモックデータ作成が必要
      recordResult('チーム分析データ取得', false, {
        error: error.message,
        requiresImplementation: true
      }, error);
      
      // フォールバック実装の提案
      logger.info('チーム分析APIのフォールバック実装が必要です');
    }
    
    // ステップ3: フォローアップ推奨データの取得
    logger.info('フォローアップ推奨データをテスト中...');
    
    try {
      const followUpResponse = await authClient.get(ANALYTICS.GET_FOLLOW_UP_RECOMMENDATIONS);
      
      const success = followUpResponse.status === 200 && 
        followUpResponse.data && 
        Array.isArray(followUpResponse.data);
      
      recordResult('フォローアップ推奨データ取得', success, {
        status: followUpResponse.status,
        hasData: !!followUpResponse.data,
        isArray: Array.isArray(followUpResponse.data),
        count: Array.isArray(followUpResponse.data) ? followUpResponse.data.length : 0
      });
      
      if (success) {
        logger.info('フォローアップ推奨データ取得成功');
      } else {
        logger.warn('フォローアップ推奨データの構造が期待と異なります');
      }
    } catch (error) {
      logger.error('フォローアップ推奨データ取得エラー:', error);
      
      // エラーが返された場合はモックデータ作成が必要
      recordResult('フォローアップ推奨データ取得', false, {
        error: error.message,
        requiresImplementation: true
      }, error);
      
      // フォールバック実装の提案
      logger.info('フォローアップ推奨APIのフォールバック実装が必要です');
    }
    
    // ステップ4: ユーザーエンゲージメントデータの取得
    logger.info('ユーザーエンゲージメントデータをテスト中...');
    
    if (userId) {
      try {
        const engagementResponse = await authClient.get(ANALYTICS.GET_USER_ENGAGEMENT(userId));
        
        const success = engagementResponse.status === 200 && 
          engagementResponse.data && 
          engagementResponse.data.metrics !== undefined;
        
        recordResult('ユーザーエンゲージメント取得', success, {
          status: engagementResponse.status,
          hasData: !!engagementResponse.data,
          dataStructure: engagementResponse.data ? {
            hasMetrics: !!engagementResponse.data.metrics,
            hasPeriod: !!engagementResponse.data.period,
          } : null
        });
        
        if (success) {
          logger.info('ユーザーエンゲージメントデータ取得成功');
        } else {
          logger.warn('ユーザーエンゲージメントデータの構造が期待と異なります');
        }
      } catch (error) {
        logger.error('ユーザーエンゲージメントデータ取得エラー:', error);
        
        // エラーが返された場合はモックデータ作成が必要
        recordResult('ユーザーエンゲージメント取得', false, {
          error: error.message,
          requiresImplementation: true
        }, error);
        
        // フォールバック実装の提案
        logger.info('ユーザーエンゲージメントAPIのフォールバック実装が必要です');
      }
    } else {
      logger.warn('ユーザーIDがないため、ユーザーエンゲージメントテストをスキップします');
      recordResult('ユーザーエンゲージメント取得', false, {
        skipped: true,
        reason: 'ユーザーIDが利用できません'
      });
    }
    
    // ステップ5: 感情分析トレンドデータの取得
    logger.info('感情分析トレンドデータをテスト中...');
    
    try {
      const sentimentResponse = await authClient.get(ANALYTICS.GET_SENTIMENT_TREND);
      
      const success = sentimentResponse.status === 200 && 
        sentimentResponse.data && 
        (sentimentResponse.data.labels !== undefined || sentimentResponse.data.datasets !== undefined);
      
      recordResult('感情分析トレンド取得', success, {
        status: sentimentResponse.status,
        hasData: !!sentimentResponse.data,
        dataStructure: sentimentResponse.data ? {
          hasLabels: Array.isArray(sentimentResponse.data.labels),
          hasDatasets: Array.isArray(sentimentResponse.data.datasets),
        } : null
      });
      
      if (success) {
        logger.info('感情分析トレンドデータ取得成功');
      } else {
        logger.warn('感情分析トレンドデータの構造が期待と異なります');
      }
    } catch (error) {
      logger.error('感情分析トレンドデータ取得エラー:', error);
      
      // エラーが返された場合はモックデータ作成が必要
      recordResult('感情分析トレンド取得', false, {
        error: error.message,
        requiresImplementation: true
      }, error);
      
      // フォールバック実装の提案
      logger.info('感情分析トレンドAPIのフォールバック実装が必要です');
    }
    
    // ステップ6: 目標達成率データの取得
    logger.info('目標達成率データをテスト中...');
    
    try {
      const goalResponse = await authClient.get(ANALYTICS.GET_GOAL_COMPLETION_RATE);
      
      const success = goalResponse.status === 200 && 
        goalResponse.data && 
        goalResponse.data.completionRate !== undefined;
      
      recordResult('目標達成率データ取得', success, {
        status: goalResponse.status,
        hasData: !!goalResponse.data,
        dataStructure: goalResponse.data ? {
          hasCompletionRate: goalResponse.data.completionRate !== undefined,
          hasTotalGoals: goalResponse.data.totalGoals !== undefined,
          hasCompletedGoals: goalResponse.data.completedGoals !== undefined,
        } : null
      });
      
      if (success) {
        logger.info('目標達成率データ取得成功');
      } else {
        logger.warn('目標達成率データの構造が期待と異なります');
      }
    } catch (error) {
      logger.error('目標達成率データ取得エラー:', error);
      
      // エラーが返された場合はモックデータ作成が必要
      recordResult('目標達成率データ取得', false, {
        error: error.message,
        requiresImplementation: true
      }, error);
      
      // フォールバック実装の提案
      logger.info('目標達成率APIのフォールバック実装が必要です');
    }
    
    // テスト完了
    logger.info('分析APIエンドポイントのテストが完了しました');
    
  } catch (error) {
    logger.error('テスト実行中に予期しないエラーが発生しました', error);
    recordResult('分析APIテスト全体', false, null, error);
  }
}

/**
 * テスト実行関数
 * このファイルが直接実行された場合に使用
 */
async function run() {
  try {
    const testName = 'analytics-endpoints-test';
    const options = {
      authenticate: false, // 自前で認証処理を行うため不要
      continueOnError: true, // エラー時も続行
      saveReport: true // レポートを保存
    };
    
    // テストランナーでテスト実行
    const result = await TestRunner.execute(testName, testMain, options);
    
    // 必要ならレポート解析を行う
    analyzeResults(result);
    
    // 終了コードを設定（CI環境での使用を想定）
    process.exitCode = result.success ? 0 : 1;
  } catch (error) {
    console.error('テスト実行エラー:', error.message);
    process.exitCode = 1;
  }
}

/**
 * テスト結果を解析してフォローアップ情報を生成
 */
function analyzeResults(results) {
  const failedTests = results.results.filter(r => !r.success);
  const implementationNeeded = failedTests.filter(r => 
    r.data && r.data.requiresImplementation === true
  );
  
  if (implementationNeeded.length > 0) {
    console.log('\n====== 実装が必要なエンドポイント ======');
    implementationNeeded.forEach(test => {
      console.log(`- ${test.name}`);
    });
    console.log('\n推奨アクション: analyticsService.tsとanalyticsController.tsを実装してください。');
    console.log('  ヒント: src_backup_mvc/services/analytics.service.tsを参考にしてください。');
  }
}

// このファイルが直接実行された場合
if (require.main === module) {
  run();
} else {
  // モジュールとしてインポートされた場合は関数をエクスポート
  module.exports = {
    testMain,
    // テスト関数をユーティリティでラップして単独実行可能にする
    test: utils.createTest(testMain, {
      name: 'analytics-endpoints-test',
      authenticate: false
    })
  };
}