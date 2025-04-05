import { Router, Request, Response } from 'express';
import { container } from 'tsyringe';
import axios from 'axios';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';
import ConversationModel from '../../../domain/models/conversation.model';
import { SystemMessageBuilderService } from '../../../application/services/system-message-builder.service';

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
              id: msg.id || `${msg.role}-${new Date(msg.timestamp).getTime()}`,
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
            id: msg.id || `${msg.role}-${new Date(msg.timestamp).getTime()}`,
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
      
      // type=fortuneの場合、ユーザーの運勢情報と日次カレンダー情報を取得
      let initialMessage = '';
      if (type === 'fortune' && !contextId && !previousMessages?.length) {
        console.log('フォーチュンタイプの新規会話を検出しました。運勢情報を取得します。');
        
        try {
          // ユーザー情報の取得
          const UserModel = mongoose.model('User');
          const user = await UserModel.findById(new mongoose.Types.ObjectId(userId));
          
          if (user) {
            console.log('ユーザー情報を取得しました:', user.name);
            
            // 当日の干支情報を取得
            let todayCalendarInfo = null;
            try {
              const DailyCalendarInfoModel = mongoose.model('DailyCalendarInfo');
              const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
              todayCalendarInfo = await DailyCalendarInfoModel.findOne({ date: today });
              console.log('当日の干支情報:', todayCalendarInfo ? '取得成功' : '未取得');
            } catch (calendarError) {
              console.warn('当日の干支情報取得エラー:', calendarError.message);
            }
            
            // SystemMessageBuilderServiceを使用して初期メッセージを構築
            const systemMessageBuilder = container.resolve<SystemMessageBuilderService>('SystemMessageBuilderService');
            initialMessage = systemMessageBuilder.createFortuneInitialMessage(user, todayCalendarInfo);
            console.log('運勢初期メッセージを作成しました（先頭100文字）:', initialMessage.substring(0, 100));
          }
        } catch (userInfoError) {
          console.error('ユーザー情報取得エラー:', userInfoError);
        }
      }
      
      // 会話が見つからない場合は新しく作成
      if (!conversation) {
        conversation = new ConversationModel({
          userId: new mongoose.Types.ObjectId(userId),
          messages: [],
          title: type === 'fortune' ? '運勢相談' : '新しい会話',
          tags: type ? [type] : ['general']
        });
        console.log('新しい会話を作成しました');
        
        // 初期メッセージがある場合は追加（一意のIDを設定）
        if (initialMessage) {
          const initialMessageId = `user-${new Date().getTime()}`;
          conversation.messages.push({
            role: 'user',
            content: initialMessage,
            timestamp: new Date(),
            id: initialMessageId
          });
          console.log('初期運勢メッセージをシステムユーザーとして追加しました');
          console.log('⚠️注意: これは単なる初期メッセージであり、詳細な地支十神情報を含むシステムメッセージとは異なります');
          console.log('⚠️詳細な四柱推命情報を含むシステムメッセージはdirect-chat.tsで構築されます');
        }
      }
      
      // 初期メッセージの生成機能はSystemMessageBuilderServiceに移行しました
      
      // Claude APIに送信するメッセージを準備
      let apiMessages = [];
      
      // 1. 最初にシステムメッセージを準備
      if (type === 'fortune' && userId) {
        console.log('四柱推命システムメッセージを準備中...');
        
        try {
          // SystemMessageBuilderServiceを使用してシステムメッセージを構築
          const systemMessageBuilder = container.resolve<SystemMessageBuilderService>('SystemMessageBuilderService');
          const context = await systemMessageBuilder.buildFortuneContextFromUserId(userId);
          
          if (context) {
            // システムメッセージを生成
            const systemMessageContent = systemMessageBuilder.buildSystemMessage(context);
            
            // システムメッセージをメッセージリストの先頭に追加
            apiMessages.unshift({
              role: 'system',
              content: systemMessageContent
            });
            
            console.log('四柱推命システムメッセージを追加しました');
            console.log('===== システムメッセージプレビュー =====');
            console.log(systemMessageContent.substring(0, 200) + '...');
            console.log('====================================');
          } else {
            console.log('四柱推命コンテキストの取得に失敗したため、システムメッセージの追加をスキップします');
          }
        } catch (error) {
          console.error('システムメッセージ構築エラー:', error instanceof Error ? error.message : '不明なエラー');
          console.log('エラーのため、システムメッセージの追加をスキップします');
        }
      }
      
      // 2. 次に会話からメッセージ履歴を取得（初期メッセージがある場合はそれも含まれる）
      if (conversation.messages && conversation.messages.length > 0) {
        // システムメッセージを保持するために、完全な置き換えではなく追加に変更
        const conversationMessages = conversation.messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
        
        // 既にシステムメッセージが含まれているかチェック
        const hasSystemMessage = apiMessages.some(msg => msg.role === 'system');
        
        if (hasSystemMessage) {
          // システムメッセージを保持しつつ、会話メッセージを追加
          const systemMessages = apiMessages.filter(msg => msg.role === 'system');
          apiMessages = [...systemMessages, ...conversationMessages];
          console.log(`システムメッセージを保持しつつ、会話からのメッセージ ${conversationMessages.length}件を追加しました`);
        } else {
          // システムメッセージがなければ単に会話メッセージを使用
          apiMessages = conversationMessages;
          console.log(`会話からのメッセージ ${conversationMessages.length}件を会話履歴に追加します`);
        }
      }
      // 3. 前のメッセージ（フロントエンドから渡されたもの）がある場合は追加
      else if (previousMessages && Array.isArray(previousMessages) && previousMessages.length > 0) {
        // システムメッセージを保持するために、完全な置き換えではなく追加に変更
        const prevMessages = previousMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
        
        // 既にシステムメッセージが含まれているかチェック
        const hasSystemMessage = apiMessages.some(msg => msg.role === 'system');
        
        if (hasSystemMessage) {
          // システムメッセージを保持しつつ、前のメッセージを追加
          const systemMessages = apiMessages.filter(msg => msg.role === 'system');
          apiMessages = [...systemMessages, ...prevMessages];
          console.log(`システムメッセージを保持しつつ、前のメッセージ ${prevMessages.length}件を追加しました`);
        } else {
          // システムメッセージがなければ単に前のメッセージを使用
          apiMessages = prevMessages;
          console.log(`前のメッセージ ${prevMessages.length}件を会話履歴に追加します`);
        }
      }
      
      // 現在のメッセージを会話に追加
      try {
        // ストリーミングを使用するかどうかを確認
        const useStreaming = req.query.stream === 'true';
        
        // ユーザーメッセージをデータベースに保存
        const now = new Date();
        const messageId = `user-${now.getTime()}`; // 一意のメッセージIDを生成
        
        // ユーザーメッセージを追加（重複しないように一度だけ）
        conversation.messages.push({
          role: 'user',
          content: message,
          timestamp: now,
          id: messageId // 明示的にIDを設定
        });
        
        // フィルタリング: 初期メッセージと現在のメッセージが同一の場合は初期メッセージを削除
        // これにより「今日の運勢情報:...」と実際のユーザーメッセージの重複を防止
        const initialContentPattern = /今日の運勢情報[\s\S]*上記の情報を踏まえて/;
        
        if (initialContentPattern.test(message)) {
          // 現在のメッセージが初期メッセージと同じパターンの場合、初期メッセージを削除
          console.log('⚠️ 初期メッセージと重複するユーザーメッセージを検出しました。初期メッセージを削除します');
          apiMessages = apiMessages.filter(msg => 
            msg.role !== 'user' || !initialContentPattern.test(msg.content)
          );
        }
        
        // フロントエンドから送信されたメッセージを追加
        apiMessages.push({ role: 'user', content: message });
        
        // APIに送信されるメッセージ構成のデバッグログ
        console.log('===== APIに送信されるメッセージ構成 =====');
        console.log(`メッセージ総数: ${apiMessages.length}`);
        console.log('システムメッセージの有無:', apiMessages.some(msg => msg.role === 'system') ? 'あり ✓' : 'なし ✗');
        
        // システムメッセージの内容を表示
        const sysMsg = apiMessages.find(msg => msg.role === 'system');
        if (sysMsg) {
          console.log('システムメッセージ内容:');
          console.log(sysMsg.content.substring(0, 200) + '...');
        }
        
        // 全メッセージの役割を表示
        apiMessages.forEach((msg, idx) => {
          console.log(`[${idx}] ${msg.role}: ${msg.content.substring(0, 50)}...`);
        });
        console.log('======================================');
        
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
            
            // システムメッセージを抽出
            const systemMessage = apiMessages.find(msg => msg.role === 'system');
            const userAssistantMessages = apiMessages.filter(msg => msg.role !== 'system');
            
            // API V2に合わせたリクエスト形式に変換
            const requestBody: {
              model: string;
              max_tokens: number;
              stream: boolean;
              messages: any[];
              system?: string;
            } = {
              model: CLAUDE_MODEL,
              max_tokens: 1000,
              stream: true, // ストリーミングを有効化
              messages: userAssistantMessages
            };
            
            // システムメッセージがあればトップレベルパラメータとして追加
            if (systemMessage) {
              requestBody.system = systemMessage.content;
              console.log('システムメッセージをトップレベルパラメータに移動しました');
            }
            
            console.log('リクエスト内容（ストリーミングモード）:', JSON.stringify(requestBody, null, 2));
            
            const response = await axios.post(
              CLAUDE_API_URL,
              requestBody,
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
                      // 安全に使用情報を取得（存在しない場合はデフォルト値を使用）
                      const usage = parsedData.message?.usage || {
                        input_tokens: 0,
                        output_tokens: 0,
                        total_tokens: 0
                      };
                      
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
            
            // エラーの詳細を取得して表示
            let errorDetails = 'APIリクエスト中にエラーが発生しました';
            if (streamError.response) {
              console.error('エラーステータス:', streamError.response.status);
              console.error('エラーデータ:', streamError.response.data);
              
              // レスポンスボディの安全な読み取り
              if (streamError.response.data) {
                try {
                  let responseBody = '';
                  
                  // ストリーム形式かどうかをチェック
                  if (typeof streamError.response.data.read === 'function') {
                    const chunk = streamError.response.data.read();
                    if (chunk !== null) {
                      responseBody = chunk.toString();
                    } else {
                      responseBody = '(空のレスポンスボディ)';
                    }
                  } else if (typeof streamError.response.data === 'object') {
                    // オブジェクト形式の場合はJSONに変換
                    responseBody = JSON.stringify(streamError.response.data);
                  } else {
                    // その他のケース
                    responseBody = String(streamError.response.data);
                  }
                  
                  console.error('エラーレスポンスボディ:', responseBody);
                  errorDetails += ` (${streamError.response.status}: ${responseBody})`;
                } catch (readError) {
                  console.error('レスポンスボディの読み取りエラー:', readError);
                }
              }
            }
            
            // クライアントにエラーを通知
            const errorEvent = {
              success: false,
              error: errorDetails
            };
            res.write(`event: error\ndata: ${JSON.stringify(errorEvent)}\n\n`);
            res.end();
          }
        } else {
          // 通常モード（ストリーミングなし）
          console.log('通常モードでClaudeAPIにリクエストを送信します...');
          
          // システムメッセージを抽出
          const systemMessage = apiMessages.find(msg => msg.role === 'system');
          const userAssistantMessages = apiMessages.filter(msg => msg.role !== 'system');
          
          // API V2に合わせたリクエスト形式に変換
          const requestBody: {
            model: string;
            max_tokens: number;
            messages: any[];
            system?: string;
          } = {
            model: CLAUDE_MODEL,
            max_tokens: 1000,
            messages: userAssistantMessages
          };
          
          // システムメッセージがあればトップレベルパラメータとして追加
          if (systemMessage) {
            requestBody.system = systemMessage.content;
            console.log('システムメッセージをトップレベルパラメータに移動しました');
          }
          
          console.log('リクエスト内容（通常モード）:', JSON.stringify(requestBody, null, 2));
          
          const response = await axios.post(
            CLAUDE_API_URL,
            requestBody,
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
          
          // AIメッセージを追加（一意のIDを生成）
          const aiMessageId = `assistant-${now.getTime()+1}`; // ユーザーメッセージよりも1ms後のIDを保証
          conversation.messages.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: now,
            id: aiMessageId // 明示的にIDを設定
          });
          
          // 会話を保存
          await conversation.save();
          console.log(`会話を保存しました (ID: ${conversation.id})`);
          
          // フロントエンドが期待する形式でレスポンスを構築
          // メッセージIDは会話からの実際のIDを使用するため、ここでの宣言は不要
          
          // 会話履歴と新しいメッセージを結合
          const allMessages = [];
          
          // 会話からメッセージを取得してフロントエンド形式に変換
          conversation.messages.forEach(msg => {
            allMessages.push({
              id: msg.id || `${msg.role}-${new Date(msg.timestamp).getTime()}`,
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
            // AIメッセージを追加（一意のIDを生成）
            const aiMessageId = `assistant-${timestamp.getTime()+1}`; // 一意のメッセージIDを生成
            conv.messages.push({
              role: 'assistant',
              content: aiContent,
              timestamp: timestamp,
              id: aiMessageId // 明示的にIDを設定
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
        
        // ユーザーメッセージを追加（一意のIDを生成）
        const userMessageId = `user-${now.getTime()}`;
        // エラー時の応答はすでに追加済みかチェック
        if (!conversation.messages.some(msg => msg.role === 'user' && msg.content === message)) {
          conversation.messages.push({
            role: 'user',
            content: message,
            timestamp: now,
            id: userMessageId
          });
        }
        
        // エラーメッセージを追加（一意のIDを生成）
        const errorMessage = `[API接続エラー] これはモックレスポンスです。あなたのメッセージ「${message}」を受け取りました。`;
        const aiMessageId = `assistant-${now.getTime()+1}`;
        conversation.messages.push({
          role: 'assistant',
          content: errorMessage,
          timestamp: now,
          id: aiMessageId
        });
        
        // 会話を保存
        await conversation.save();
        console.log(`エラー時の会話を保存しました (ID: ${conversation.id})`);
        
        // 会話履歴の準備
        const allMessages = conversation.messages.map(msg => ({
          id: msg.id || `${msg.role}-${new Date(msg.timestamp).getTime()}`,
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