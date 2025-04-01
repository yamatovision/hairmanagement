/**
 * ConversationEventHandlers
 * 会話イベントハンドラー
 * 
 * 変更履歴:
 * - 2025/3/30: 初期実装 (Claude)
 */

import { injectable, inject } from 'tsyringe';
import { IEventBus } from '../EventBus';
import { logger } from '../../../utils/logger.util';
import {
  ConversationCreatedEvent,
  MessageAddedEvent,
  SentimentAnalyzedEvent,
  ElementalTaggingEvent,
  ConversationEndedEvent
} from '../../../domain/events/conversation/ConversationEvents';

/**
 * 会話イベントハンドラー
 */
@injectable()
export class ConversationEventHandlers {
  /**
   * コンストラクタ
   */
  constructor(
    @inject('IEventBus') private eventBus: IEventBus
  ) {
    this.registerHandlers();
  }

  /**
   * ハンドラーの登録
   */
  private registerHandlers(): void {
    this.eventBus.subscribe('conversation.created', this.handleConversationCreated.bind(this));
    this.eventBus.subscribe('conversation.message.added', this.handleMessageAdded.bind(this));
    this.eventBus.subscribe('conversation.sentiment.analyzed', this.handleSentimentAnalyzed.bind(this));
    this.eventBus.subscribe('conversation.elemental.tagged', this.handleElementalTagging.bind(this));
    this.eventBus.subscribe('conversation.ended', this.handleConversationEnded.bind(this));
    
    logger.info('会話イベントハンドラーが登録されました');
  }

  /**
   * 会話作成イベントの処理
   */
  private async handleConversationCreated(event: ConversationCreatedEvent): Promise<void> {
    try {
      logger.info(`会話作成イベントを処理: ${event.conversationId} (ユーザー: ${event.userId})`);
      
      // ここに会話作成後の処理を実装
      // 例: アナリティクス記録の初期化など
      
      // 運勢関連コンテキストがあればログ記録
      if (event.contextData?.fortuneId) {
        logger.debug(`運勢関連会話が開始されました: fortuneId=${event.contextData.fortuneId}`);
        // 実際の実装では必要に応じてサービスを呼び出す
        // await this.analyticsService.trackFortuneConversationStart(event.userId, event.contextData.fortuneId);
      }
      
      // チーム関連コンテキストがあればログ記録
      if (event.contextData?.teamId) {
        logger.debug(`チーム関連会話が開始されました: teamId=${event.contextData.teamId}`);
        // 実際の実装では必要に応じてサービスを呼び出す
        // await this.analyticsService.trackTeamConversationStart(event.userId, event.contextData.teamId);
      }
      
    } catch (error) {
      logger.error(`会話作成イベントの処理中にエラーが発生しました: ${event.conversationId}`, error);
    }
  }

  /**
   * メッセージ追加イベントの処理
   */
  private async handleMessageAdded(event: MessageAddedEvent): Promise<void> {
    try {
      logger.info(`メッセージ追加イベントを処理: ${event.messageId} (会話: ${event.conversationId})`);
      
      // ここにメッセージ追加後の処理を実装
      // 例: アナリティクス記録、感情分析トリガーなど
      
      // ユーザーメッセージの場合、感情分析をトリガーする可能性がある
      if (event.isUserMessage) {
        logger.debug(`ユーザーメッセージを受信: 感情分析と五行属性分析をトリガー可能`);
        
        // 実際の実装では必要に応じてサービスを呼び出す
        // 感情分析を非同期で実行できる
        // this.sentimentAnalysisService.analyzeAsync(event.conversationId, event.messageId, event.content);
        
        // 五行属性分析も非同期で実行できる
        // this.elementalAnalysisService.tagAsync(event.conversationId, event.messageId, event.content);
      }
      
    } catch (error) {
      logger.error(`メッセージ追加イベントの処理中にエラーが発生しました: ${event.messageId}`, error);
    }
  }

  /**
   * 感情分析結果イベントの処理
   */
  private async handleSentimentAnalyzed(event: SentimentAnalyzedEvent): Promise<void> {
    try {
      logger.info(`感情分析結果イベントを処理: ${event.messageId} (スコア: ${event.sentiment.score})`);
      
      // ここに感情分析後の処理を実装
      // 例: アナリティクス記録、引継ぎアクションなど
      
      // 感情スコアが負の場合、特別な処理を実行する可能性がある
      if (event.sentiment.score < -0.5) {
        logger.debug(`強い負の感情を検出: ${event.sentiment.score}`);
        // 実際の実装では必要に応じてサービスを呼び出す
        // await this.analyticsService.recordNegativeSentiment(event.conversationId, event.messageId, event.sentiment.score);
        // await this.conversationService.flagForFollowup(event.conversationId, 'negative_sentiment');
      }
      
      // 分析結果をデータベースに保存
      // this.conversationRepository.saveSentimentAnalysis(event.messageId, event.sentiment);
      
    } catch (error) {
      logger.error(`感情分析結果イベントの処理中にエラーが発生しました: ${event.messageId}`, error);
    }
  }

  /**
   * 五行属性タグ付けイベントの処理
   */
  private async handleElementalTagging(event: ElementalTaggingEvent): Promise<void> {
    try {
      logger.info(`五行属性タグ付けイベントを処理: ${event.messageId}`);
      logger.debug(`属性: ${event.elementalAttributes.element || 'none'}, 陰陽: ${event.elementalAttributes.yinYang || 'none'}`);
      
      // ここに五行属性タグ付け後の処理を実装
      // 例: ユーザーの五行プロファイルとの比較、レコメンド生成など
      
      // ユーザーの五行プロファイルとメッセージの属性を比較し、アクションを生成する可能性がある
      if (event.elementalAttributes.element) {
        // 実際の実装では必要に応じてサービスを呼び出す
        // const userProfile = await this.userService.getElementalProfile(event.userId);
        // if (userProfile && userProfile.element !== event.elementalAttributes.element) {
        //   // 不一致があればレコメンドを生成
        //   await this.recommendationService.generateElementalAdvice(
        //     event.userId,
        //     userProfile.element,
        //     event.elementalAttributes.element
        //   );
        // }
      }
      
      // 分析結果をデータベースに保存
      // this.conversationRepository.saveElementalTagging(event.messageId, event.elementalAttributes);
      
    } catch (error) {
      logger.error(`五行属性タグ付けイベントの処理中にエラーが発生しました: ${event.messageId}`, error);
    }
  }

  /**
   * 会話終了イベントの処理
   */
  private async handleConversationEnded(event: ConversationEndedEvent): Promise<void> {
    try {
      logger.info(`会話終了イベントを処理: ${event.conversationId}`);
      logger.debug(`メッセージ数: ${event.messageCount}, 所要時間: ${event.duration}ms`);
      
      // ここに会話終了後の処理を実装
      // 例: 会話サマリの生成、分析レポートの生成など
      
      // 会話分析を行い、アナリティクスを更新
      // 実際の実装では必要に応じてサービスを呼び出す
      // await this.analyticsService.processCompletedConversation(
      //   event.conversationId,
      //   event.userId,
      //   event.messageCount,
      //   event.duration,
      //   event.summary
      // );
      
      // メッセージ数が多い場合、フォローアップ候補としてフラグ付け
      if (event.messageCount > 10) {
        // await this.conversationService.flagForFollowup(event.conversationId, 'lengthy_conversation');
      }
      
    } catch (error) {
      logger.error(`会話終了イベントの処理中にエラーが発生しました: ${event.conversationId}`, error);
    }
  }
}
