import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import axios from 'axios';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';
import ConversationModel from '../../../domain/models/conversation.model';

/**
 * 直接会話APIルート - 履歴を保存するシンプルな会話
 * クリーンアーキテクチャのルート登録システムに統合されたバージョン
 */
export const registerSimpleConversationRoutes = (router: Router): void => {
  console.log('直接会話ルートを登録中...');
  
  // 認証ミドルウェアの取得
  let authMiddleware: any;
  try {
    authMiddleware = container.resolve<any>('AuthMiddleware');
    console.log('直接会話ルート: AuthMiddleware を解決しました');
  } catch (error) {
    console.error('AuthMiddleware 解決エラー:', error);
    const { AuthMiddleware: AuthMiddlewareClass } = require('../middlewares/auth.middleware');
    authMiddleware = new AuthMiddlewareClass();
    console.log('直接会話ルート: AuthMiddleware を手動で作成しました');
  }
  
  // 環境変数の取得
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'dummy-api-key';
  const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
  const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';
  
  // エンドポイント設定情報をログ出力
  console.log('直接会話ルート: Claude AI設定');
  console.log(`- API URL: ${CLAUDE_API_URL}`);
  console.log(`- モデル: ${CLAUDE_MODEL}`);
  console.log(`- APIキー: ${CLAUDE_API_KEY.substring(0, 10)}...`);
  
  // シンプル会話エンドポイント
  router.post('/simple-chat', authMiddleware.handle(), async (req: Request, res: Response) => {
    console.log('シンプルチャットエンドポイントが呼び出されました');
    console.log('リクエストボディ:', req.body);
    
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'メッセージを入力してください'
      });
    }
    
    // シンプルなレスポンスを返す
    return res.json({
      success: true,
      data: {
        message: `こんにちは！あなたのメッセージに応答します: ${message}`,
        timestamp: new Date().toISOString()
      }
    });
  });
  
  // 直接会話履歴取得エンドポイント
  router.get('/direct-conversations', authMiddleware.handle(), async (req: Request, res: Response) => {
    console.log('直接会話履歴取得エンドポイントが呼び出されました');
    
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }
      
      console.log(`ユーザーID ${userId} の会話履歴を取得します`);
      
      // ユーザーの会話履歴を取得
      const conversations = await ConversationModel.findByUserId(new mongoose.Types.ObjectId(userId));
      
      return res.json({
        success: true,
        data: {
          conversations: conversations.map(conv => ({
            id: conv.id,
            title: conv.title || '無題の会話',
            messages: conv.messages.map(msg => ({
              id: `${msg.role}-${new Date(msg.timestamp).getTime()}`,
              sender: msg.role,
              content: msg.content,
              timestamp: msg.timestamp
            })),
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            type: conv.tags?.includes('fortune') ? 'fortune' : 
                  conv.tags?.includes('team') ? 'team' : 'general',
            contextId: conv.id
          })),
        }
      });
    } catch (error) {
      console.error('会話履歴取得エラー:', error);
      return res.status(500).json({
        success: false,
        message: '会話履歴の取得中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // 特定の会話履歴取得エンドポイント
  router.get('/direct-conversations/:id', authMiddleware.handle(), async (req: Request, res: Response) => {
    console.log('特定の会話履歴取得エンドポイントが呼び出されました');
    
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }
      
      console.log(`ユーザーID ${userId} の会話ID ${conversationId} を取得します`);
      
      // 特定の会話を取得
      const conversation = await ConversationModel.findOne({
        _id: new mongoose.Types.ObjectId(conversationId),
        userId: new mongoose.Types.ObjectId(userId)
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '会話が見つかりません'
        });
      }
      
      return res.json({
        success: true,
        data: {
          id: conversation.id,
          title: conversation.title || '無題の会話',
          messages: conversation.messages.map(msg => ({
            id: `${msg.role}-${new Date(msg.timestamp).getTime()}`,
            sender: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          type: conversation.tags?.includes('fortune') ? 'fortune' : 
                conversation.tags?.includes('team') ? 'team' : 'general',
          contextId: conversation.id
        }
      });
    } catch (error) {
      console.error('特定の会話取得エラー:', error);
      return res.status(500).json({
        success: false,
        message: '会話の取得中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // 会話削除エンドポイント
  router.delete('/direct-conversations/:id', authMiddleware.handle(), async (req: Request, res: Response) => {
    console.log('会話削除エンドポイントが呼び出されました');
    
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }
      
      console.log(`ユーザーID ${userId} の会話ID ${conversationId} を削除します`);
      
      // 会話を削除する前に権限をチェック
      const conversation = await ConversationModel.findOne({
        _id: new mongoose.Types.ObjectId(conversationId),
        userId: new mongoose.Types.ObjectId(userId)
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '会話が見つかりません'
        });
      }
      
      // 会話を削除
      await ConversationModel.deleteOne({
        _id: new mongoose.Types.ObjectId(conversationId),
        userId: new mongoose.Types.ObjectId(userId)
      });
      
      console.log(`会話ID ${conversationId} を削除しました`);
      
      return res.json({
        success: true,
        message: '会話を削除しました',
        data: { id: conversationId }
      });
    } catch (error) {
      console.error('会話削除エラー:', error);
      return res.status(500).json({
        success: false,
        message: '会話の削除中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // 直接会話エンドポイント
  router.post('/direct-conversations', authMiddleware.handle(), async (req: Request, res: Response) => {
    console.log('直接会話エンドポイントが呼び出されました');
    console.log('リクエストヘッダー:', req.headers);
    console.log('リクエストボディ:', req.body);
    
    try {
      const { message, previousMessages, type, contextId } = req.body;
      const userId = req.user?.id;
      
      console.log('user情報:', req.user);
      console.log(`ユーザーID: ${userId}`);
      console.log(`メッセージタイプ: ${type || 'なし'}`);
      console.log(`コンテキストID: ${contextId || 'なし'}`);
      console.log(`前のメッセージ数: ${previousMessages?.length || 0}`);
      
      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'メッセージを入力してください'
        });
      }
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }
      
      console.log(`ユーザー ${userId} からのメッセージ:`, message);
      
      // 既存の会話を探す、または新しい会話を作成
      let conversation;
      if (contextId && contextId !== 'default' && mongoose.Types.ObjectId.isValid(contextId)) {
        // 既存の会話を取得
        conversation = await ConversationModel.findOne({
          _id: new mongoose.Types.ObjectId(contextId),
          userId: new mongoose.Types.ObjectId(userId)
        });
        
        if (conversation) {
          console.log(`会話ID ${contextId} を見つけました`);
        } else {
          console.log(`会話ID ${contextId} が見つかりません。新しい会話を作成します。`);
        }
      }
      
      // 会話が見つからない場合は新しく作成
      if (!conversation) {
        conversation = new ConversationModel({
          userId: new mongoose.Types.ObjectId(userId),
          messages: [],
          title: '新しい会話',
          tags: type ? [type] : ['general']
        });
        console.log('新しい会話を作成しました');
      }
      
      // Claude APIに送信するメッセージを準備
      let apiMessages = [];
      
      // 前のメッセージがある場合は追加
      if (previousMessages && Array.isArray(previousMessages) && previousMessages.length > 0) {
        apiMessages = previousMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
        console.log(`前のメッセージ ${apiMessages.length}件を会話履歴に追加します`);
      }
      
      // 現在のメッセージを追加
      apiMessages.push({ role: 'user', content: message });
      
      try {
        // ストリーミングを使用するかどうかを確認
        const useStreaming = req.query.stream === 'true';
        
        // ユーザーメッセージをデータベースに保存
        const now = new Date();
        conversation.messages.push({
          role: 'user',
          content: message,
          timestamp: now
        });
        
        // ストリーミングモードの場合
        if (useStreaming) {
          console.log('ストリーミングモードでClaudeAPIにリクエストを送信します...');
          
          // SSEヘッダーを設定
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          
          // 最初のイベントを送信（会話の初期情報）
          const initialData = {
            success: true,
            data: {
              contextId: conversation.id,
              type: type || 'general',
              streamStart: true
            }
          };
          res.write(`event: start\ndata: ${JSON.stringify(initialData)}\n\n`);
          
          // AIの応答を格納する変数
          let fullAiResponse = '';
          
          try {
            // Claude APIにリクエストを送信（ストリーミングモード）
            const response = await axios.post(
              CLAUDE_API_URL,
              {
                model: CLAUDE_MODEL,
                max_tokens: 1000,
                stream: true, // ストリーミングを有効化
                messages: apiMessages
              },
              {
                headers: {
                  'x-api-key': CLAUDE_API_KEY,
                  'anthropic-version': '2023-06-01',
                  'content-type': 'application/json'
                },
                responseType: 'stream', // ストリームレスポンスタイプ
                timeout: 60000 // 60秒タイムアウト
              }
            );
            
            // データチャンクを処理
            response.data.on('data', (chunk) => {
              const chunkStr = chunk.toString();
              const lines = chunkStr.split('\n');
              
              lines.forEach(line => {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6); // 'data: ' を削除
                  
                  try {
                    // JSONをパース
                    const parsedData = JSON.parse(data);
                    
                    // content_block_delta イベントの場合（テキスト部分）
                    if (parsedData.type === 'content_block_delta' && 
                        parsedData.delta && 
                        parsedData.delta.type === 'text_delta') {
                      
                      const textDelta = parsedData.delta.text;
                      fullAiResponse += textDelta;
                      
                      // クライアントにストリーミングイベントを送信
                      const deltaEvent = {
                        success: true,
                        data: {
                          delta: textDelta,
                          index: parsedData.index
                        }
                      };
                      res.write(`event: delta\ndata: ${JSON.stringify(deltaEvent)}\n\n`);
                    }
                    
                    // message_stop イベントの場合（メッセージ終了）
                    if (parsedData.type === 'message_stop') {
                      const usage = parsedData.message.usage;
                      
                      // 使用状況データをクライアントに送信
                      const finalEvent = {
                        success: true,
                        data: {
                          usage,
                          complete: true
                        }
                      };
                      res.write(`event: complete\ndata: ${JSON.stringify(finalEvent)}\n\n`);
                      
                      // 会話を保存（完全な応答が得られた後）
                      saveConversation(conversation, fullAiResponse, now);
                    }
                  } catch (e) {
                    console.error('ストリーミングデータのパースエラー:', e);
                  }
                }
              });
            });
            
            // ストリーム終了時の処理
            response.data.on('end', () => {
              // 会話が保存されたことを確認
              if (fullAiResponse) {
                console.log('ストリーミング完了、会話履歴を更新しました');
              }
              res.end();
            });
            
            // エラー処理
            response.data.on('error', (err) => {
              console.error('ストリーミングエラー:', err);
              const errorEvent = {
                success: false,
                error: 'ストリーミング中にエラーが発生しました'
              };
              res.write(`event: error\ndata: ${JSON.stringify(errorEvent)}\n\n`);
              res.end();
            });
            
          } catch (streamError) {
            console.error('ストリーミングリクエストエラー:', streamError);
            const errorEvent = {
              success: false,
              error: 'APIリクエスト中にエラーが発生しました'
            };
            res.write(`event: error\ndata: ${JSON.stringify(errorEvent)}\n\n`);
            res.end();
          }
        } else {
          // 通常モード（ストリーミングなし）
          console.log('通常モードでClaudeAPIにリクエストを送信します...');
          const response = await axios.post(
            CLAUDE_API_URL,
            {
              model: CLAUDE_MODEL,
              max_tokens: 1000,
              messages: apiMessages
            },
            {
              headers: {
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
              },
              timeout: 30000 // 30秒タイムアウト
            }
          );
          
          console.log('Claude APIからのレスポンス受信');
          console.log('レスポンスデータ構造:', Object.keys(response.data).join(', '));
          
          // レスポンスをパース
          let aiResponse = '';
          if (response.data && response.data.content && Array.isArray(response.data.content) && response.data.content.length > 0) {
            aiResponse = response.data.content[0].text;
            console.log('AIレスポンスを正常に抽出:', aiResponse.substring(0, 50) + '...');
          } else {
            console.error('予期しない形式のClaudeAI応答:', response.data);
            aiResponse = 'AIからの応答を処理できませんでした。';
          }
          
          // AIメッセージを追加
          conversation.messages.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: now
          });
          
          // 会話を保存
          await conversation.save();
          console.log(`会話を保存しました (ID: ${conversation.id})`);
          
          // フロントエンドが期待する形式でレスポンスを構築
          const userMessageId = `user-${Date.now()}`;
          const aiMessageId = `ai-${Date.now()}`;
          
          // 会話履歴と新しいメッセージを結合
          const allMessages = [];
          
          // 会話からメッセージを取得してフロントエンド形式に変換
          conversation.messages.forEach(msg => {
            allMessages.push({
              id: `${msg.role}-${new Date(msg.timestamp).getTime()}`,
              sender: msg.role,
              content: msg.content,
              timestamp: msg.timestamp
            });
          });
          
          // レスポンスを送信
          console.log('クライアントにレスポンスを送信します');
          return res.json({
            success: true,
            data: {
              messages: allMessages,
              usage: response.data.usage,
              type: type || 'general',
              contextId: conversation.id
            }
          });
        }
        
        // 会話データベースに保存するヘルパー関数
        async function saveConversation(conv, aiContent, timestamp) {
          try {
            // AIメッセージを追加
            conv.messages.push({
              role: 'assistant',
              content: aiContent,
              timestamp: timestamp
            });
            
            // 会話を保存
            await conv.save();
            console.log(`会話を保存しました (ID: ${conv.id})`);
          } catch (saveError) {
            console.error('会話保存エラー:', saveError);
          }
        }
      } catch (claudeError) {
        console.error('Claude API呼び出しエラー:', claudeError);
        
        // Claude APIの代わりにモックレスポンスを返す
        const now = new Date();
        const userMessageId = `user-${now.getTime()}`;
        const aiMessageId = `ai-${now.getTime()}`;
        
        // ユーザーメッセージを追加
        conversation.messages.push({
          role: 'user',
          content: message,
          timestamp: now
        });
        
        // エラーメッセージを追加
        const errorMessage = `[API接続エラー] これはモックレスポンスです。あなたのメッセージ「${message}」を受け取りました。`;
        conversation.messages.push({
          role: 'assistant',
          content: errorMessage,
          timestamp: now
        });
        
        // 会話を保存
        await conversation.save();
        console.log(`エラー時の会話を保存しました (ID: ${conversation.id})`);
        
        // 会話履歴の準備
        const allMessages = conversation.messages.map(msg => ({
          id: `${msg.role}-${new Date(msg.timestamp).getTime()}`,
          sender: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }));
        
        return res.json({
          success: true,
          data: {
            messages: allMessages,
            usage: { input_tokens: 10, output_tokens: 10, total_tokens: 20 },
            type: type || 'general',
            contextId: conversation.id,
            error: 'Claude API接続エラー'
          }
        });
      }
    } catch (error) {
      console.error('直接会話エラー:', error);
      console.error('スタックトレース:', error instanceof Error ? error.stack : '利用不可');
      return res.status(500).json({
        success: false,
        message: 'エラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });

  console.log('直接会話ルートの登録が完了しました');
};