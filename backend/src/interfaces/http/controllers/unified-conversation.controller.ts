/**
 * 統合会話コントローラー
 * 
 * direct-chatモジュールとconversation.controllerを統合し、
 * 一貫したAPIインターフェースを提供します。
 * 四柱推命データを活用した高度な会話コンテキストを構築し、
 * ストリーミングと非ストリーミングの両方のモードをサポートします。
 * 
 * 作成日: 2025/04/05
 */
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { UnifiedConversationService, StreamingCallbacks } from '../../../application/services/unified-conversation.service';
import { logger } from '../../../utils/logger.util';

/**
 * 統合会話コントローラー
 * direct-chatとconversation-controllerの機能を統合
 */
@injectable()
export class UnifiedConversationController {
  constructor(
    @inject('UnifiedConversationService') private conversationService: UnifiedConversationService
  ) {
    logger.info('統合会話コントローラーが初期化されました');
  }

  /**
   * 会話の初期化または継続 
   * POST /api/v1/direct-conversations
   */
  async initializeConversation(req: Request, res: Response, next: NextFunction) {
    console.log('会話初期化リクエスト受信:', req.body);
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      const { type, contextId } = req.body;
      console.log(`会話初期化: userId=${userId}, type=${type}, contextId=${contextId}`);
      
      // 会話を初期化
      const conversation = await this.conversationService.initializeConversation(
        userId, 
        type, 
        contextId
      );
      
      // レスポンスを整形
      const formattedConversation = this.formatConversationResponse(conversation);
      
      return res.status(200).json({
        success: true,
        data: formattedConversation
      });
    } catch (error) {
      logger.error('会話初期化エラー:', error);
      next(error);
    }
  }

  /**
   * メッセージを送信する
   * POST /api/v1/direct-conversations/messages
   * ストリーミングモードはクエリパラメータ ?stream=true で指定
   */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      const { message, type, contextId, previousMessages } = req.body;
      
      if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'メッセージ内容は必須です'
        });
      }
      
      logger.debug(`メッセージ送信: userId=${userId}, type=${type}, contextId=${contextId}`);
      
      // ストリーミングモードを確認
      const useStreaming = req.query.stream === 'true';
      
      if (useStreaming) {
        // Server-Sent Eventsの設定
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        
        // 接続開始イベントを送信
        this.sendSSE(res, 'open', { 
          status: 'connected',
          message: 'ストリーミング接続が開始されました'
        });
        
        // ストリーミングコールバック
        const streamCallbacks: StreamingCallbacks = {
          onStart: (data) => {
            this.sendSSE(res, 'start', data);
          },
          
          onDelta: (data) => {
            this.sendSSE(res, 'delta', data);
          },
          
          onComplete: (data) => {
            this.sendSSE(res, 'complete', data);
            
            // 接続を閉じる
            res.end();
          },
          
          onError: (error) => {
            this.sendSSE(res, 'error', {
              message: error instanceof Error ? error.message : '不明なエラー'
            });
            
            // 接続を閉じる
            res.end();
          }
        };
        
        // ストリーミングモードでメッセージを送信
        await this.conversationService.sendMessage(
          userId,
          message,
          type,
          contextId,
          previousMessages || [],
          streamCallbacks
        );
        
        // 注: レスポンスはストリーミングコールバックで処理されるため、ここではreturnしない
      } else {
        // 通常モードでメッセージを送信
        const result = await this.conversationService.sendMessage(
          userId,
          message,
          type,
          contextId,
          previousMessages || []
        );
        
        // レスポンスを整形
        const formattedConversation = this.formatConversationResponse(result);
        
        return res.status(200).json({
          success: true,
          data: formattedConversation
        });
      }
    } catch (error) {
      logger.error('メッセージ送信エラー:', error);
      
      if (!res.headersSent) {
        next(error);
      }
    }
  }

  /**
   * 会話履歴を取得する
   * GET /api/v1/direct-conversations/:id
   */
  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      logger.debug(`会話取得: ${conversationId} by ${userId}`);
      
      // 会話の取得
      const conversation = await this.conversationService.getConversationById(
        conversationId,
        userId
      );
      
      // レスポンスを整形
      const formattedConversation = this.formatConversationResponse(conversation);
      
      return res.status(200).json({
        success: true,
        data: formattedConversation
      });
    } catch (error) {
      logger.error('会話取得エラー:', error);
      
      if (error instanceof Error && 
          (error.message === 'Conversation not found' || 
           error.message === 'Unauthorized access to conversation')) {
        return res.status(404).json({
          success: false,
          message: '会話が見つかりません'
        });
      }
      
      next(error);
    }
  }

  /**
   * ユーザーの会話一覧を取得する
   * GET /api/v1/direct-conversations
   */
  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      // ページネーションパラメータ
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      logger.debug(`会話一覧取得: userId=${userId}, limit=${limit}, offset=${offset}`);
      
      // 会話一覧の取得
      const conversations = await this.conversationService.getConversationsByUserId(
        userId,
        { limit, offset }
      );
      
      // レスポンスを整形
      const formattedConversations = conversations.map(conv => 
        this.formatConversationSummary(conv)
      );
      
      return res.status(200).json({
        success: true,
        data: {
          conversations: formattedConversations,
          count: formattedConversations.length,
          limit,
          offset
        }
      });
    } catch (error) {
      logger.error('会話一覧取得エラー:', error);
      next(error);
    }
  }

  /**
   * 会話を削除する
   * DELETE /api/v1/direct-conversations/:id
   */
  async deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      logger.debug(`会話削除: ${conversationId} by ${userId}`);
      
      // 会話の削除
      await this.conversationService.deleteConversation(
        conversationId,
        userId
      );
      
      return res.status(200).json({
        success: true,
        message: '会話が削除されました'
      });
    } catch (error) {
      logger.error('会話削除エラー:', error);
      
      if (error instanceof Error && 
          (error.message === 'Conversation not found' || 
           error.message === 'Unauthorized access to conversation')) {
        return res.status(404).json({
          success: false,
          message: '会話が見つかりません'
        });
      }
      
      next(error);
    }
  }

  /**
   * レスポンス用に会話を整形する
   */
  private formatConversationResponse(conversation: any) {
    if (!conversation) {
      return null;
    }
    
    return {
      id: conversation.id,
      type: conversation.type,
      messages: conversation.messages.map((msg: any) => ({
        id: msg.id,
        sender: msg.role === 'user' ? 'user' : msg.role === 'system' ? 'system' : 'assistant',
        content: msg.content,
        timestamp: msg.createdAt?.toISOString() || new Date().toISOString()
      })),
      metadata: conversation.metadata || {},
      createdAt: conversation.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: conversation.updatedAt?.toISOString() || conversation.createdAt?.toISOString() || new Date().toISOString()
    };
  }

  /**
   * 一覧表示用に会話概要を整形する
   */
  private formatConversationSummary(conversation: any) {
    if (!conversation) {
      return null;
    }
    
    const messages = conversation.messages || [];
    const lastUserMessage = messages.filter((msg: any) => msg.role === 'user').pop();
    const lastAiMessage = messages.filter((msg: any) => msg.role === 'assistant').pop();
    const messageCount = messages.filter((msg: any) => msg.role !== 'system').length;
    
    return {
      id: conversation.id,
      type: conversation.type,
      preview: {
        lastUserMessage: lastUserMessage ? {
          content: this.truncateText(lastUserMessage.content, 50),
          timestamp: lastUserMessage.createdAt?.toISOString() || new Date().toISOString()
        } : null,
        lastAiMessage: lastAiMessage ? {
          content: this.truncateText(lastAiMessage.content, 50),
          timestamp: lastAiMessage.createdAt?.toISOString() || new Date().toISOString()
        } : null
      },
      messageCount,
      metadata: conversation.metadata || {},
      createdAt: conversation.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: conversation.updatedAt?.toISOString() || conversation.createdAt?.toISOString() || new Date().toISOString()
    };
  }

  /**
   * テキストを指定された長さに切り詰める
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Server-Sent Eventsメッセージを送信する
   */
  private sendSSE(res: Response, event: string, data: any) {
    try {
      // データをJSONシリアライズ
      const serializedData = JSON.stringify(data);
      
      // イベント名と内容を指定して送信
      res.write(`event: ${event}\n`);
      res.write(`data: ${serializedData}\n\n`);
      
      // バッファをフラッシュ
      const expressResponse = res as any;
      if (typeof expressResponse.flush === 'function') {
        expressResponse.flush();
      }
    } catch (error) {
      logger.error('SSEメッセージ送信エラー:', error);
    }
  }

  /**
   * 互換性のため、レガシーコントローラーからリダイレクトする
   * この関数はconversation.controllerから呼び出されることを想定
   */
  async handleLegacyRequest(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug('レガシーリクエストを処理します', {
        method: req.method,
        url: req.url,
        params: req.params,
        body: req.body
      });
      
      const method = req.method.toUpperCase();
      
      if (method === 'POST' && !req.params.id) {
        // 会話開始/継続のリクエスト
        return this.initializeConversation(req, res, next);
      } else if (method === 'POST' && req.params.id) {
        // メッセージ送信のリクエスト
        // URLからIDを取得してbodyに追加
        req.body.conversationId = req.params.id;
        return this.sendMessage(req, res, next);
      } else if (method === 'GET' && req.params.id) {
        // 会話詳細取得のリクエスト
        return this.getConversation(req, res, next);
      } else if (method === 'GET' && !req.params.id) {
        // 会話一覧取得のリクエスト
        return this.getConversations(req, res, next);
      } else if (method === 'DELETE' && req.params.id) {
        // 会話削除のリクエスト
        return this.deleteConversation(req, res, next);
      } else {
        // サポートされていないリクエスト
        return res.status(405).json({
          success: false,
          message: 'メソッドはサポートされていません'
        });
      }
    } catch (error) {
      logger.error('レガシーリクエスト処理エラー:', error);
      next(error);
    }
  }
}