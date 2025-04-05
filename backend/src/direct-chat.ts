/**
 * 直接Claude AIと通信するためのシンプルなエンドポイント実装
 * 詳細なログ付き
 */

/**
 * 直接チャットモジュール
 * 
 * このモジュールはフロントエンドからのリクエストを直接処理し、Claude AIに送信するためのエンドポイントを提供します。
 * 主な機能:
 * - ユーザーの四柱推命情報（四柱、十神、地支十神など）をリポジトリから取得
 * - ユーザーの基本情報と運勢情報をシステムメッセージとして構築
 * - Claude AIにリクエストを送信し、レスポンスをフォーマットして返却
 * 
 * 更新履歴:
 * - 2025/04/04: 四柱推命情報を詳細に取得し、AIプロンプトに含める機能を実装
 * - 2025/04/04: バリデーションとエラーハンドリングを強化
 */

import axios from 'axios';
import { Express, Request, Response } from 'express';
import { container } from 'tsyringe';
import { AuthMiddleware } from './interfaces/http/middlewares/auth.middleware';
import { IUserRepository } from './domain/repositories/IUserRepository';
import { IFortuneRepository } from './domain/repositories/IFortuneRepository';
import { ITeamRepository } from './domain/repositories/ITeamRepository';
import { SystemMessageBuilderService } from './application/services/system-message-builder.service';

/**
 * 直接チャットエンドポイントをアプリケーションに追加
 */
export function addDirectChatEndpoint(app: Express): void {
  console.log('===== 直接チャットエンドポイントの追加処理開始 =====');
  
  try {
    // ヘルスチェックエンドポイントを追加（直接チャット固有のヘルスチェック）
    app.get('/api/v1/direct-chat/health', (_, res) => {
      res.status(200).json({
        status: 'ok',
        feature: 'direct-chat',
        time: new Date().toISOString()
      });
    });
    console.log('直接チャット専用ヘルスチェックエンドポイントを追加しました');
    
    // 認証ミドルウェアとAPIキーを取得
    console.log('コンテナから AuthMiddleware を解決します...');
    let authMiddleware;
    try {
      authMiddleware = container.resolve<any>('AuthMiddleware');
      console.log('AuthMiddleware 解決成功:', authMiddleware ? 'インスタンス取得成功' : '未取得');
    } catch (error) {
      console.error('AuthMiddleware 解決エラー:', error);
      console.error('代替方法でAuthMiddlewareを作成します...');
      // 代替方法: 直接インスタンス化
      const { AuthMiddleware: AuthMiddlewareClass } = require('./interfaces/http/middlewares/auth.middleware');
      authMiddleware = new AuthMiddlewareClass();
    }
    
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'dummy-api-key';
    const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';
    
    // モデルとAPIキーの情報をログに出力
    console.log(`直接チャットエンドポイント設定:`);
    console.log(`- モデル: ${CLAUDE_MODEL}`);
    console.log(`- APIキー: ${CLAUDE_API_KEY.substring(0, 10)}...`);
    
    // エンドポイントのパス
    const endpointPath = '/api/v1/direct-conversations';
    console.log(`エンドポイントパス: ${endpointPath}`);
    
    // Express appが有効か確認
    console.log('Express appが有効か確認:', app != null ? 'OK' : 'エラー - appがnullまたはundefined');
    if (app && typeof app === 'object') {
      console.log('Express appのメソッド:', Object.keys(app).join(', '));
    }
    
    // シンプルなチャットエンドポイント
    console.log(`エンドポイント登録開始: POST ${endpointPath}`);
    
    // 完全なパス指定でPOSTエンドポイントを登録
    console.log('直接エンドポイントを登録します: POST /api/v1/direct-conversations');
    app.post('/api/v1/direct-conversations', (req, res, next) => {
      console.log('======= 直接チャットエンドポイント呼び出し開始 =======');
      console.log('リクエストヘッダー:', req.headers);
      console.log('リクエストボディ:', req.body);
      console.log('authMiddleware.handle()を実行します...');
      
      // 認証ミドルウェアを実行
      try {
        // 認証ミドルウェアをバインドしてハンドラ関数を取得
        const authHandler = authMiddleware.handle();
        console.log('認証ハンドラ取得成功。実行します...');
        
        // 認証ハンドラを実行
        authHandler(req, res, (err) => {
          if (err) {
            console.error('認証ミドルウェアエラー:', err);
            return res.status(401).json({ 
              success: false, 
              message: '認証エラー', 
              error: err.message 
            });
          }
          
          console.log('認証成功。メインハンドラに進みます。');
          handleChatRequest(req, res);
        });
      } catch (authError) {
        console.error('認証処理中のエラー:', authError);
        return res.status(500).json({ 
          success: false, 
          message: '認証処理中のサーバーエラー', 
          error: authError instanceof Error ? authError.message : '不明なエラー' 
        });
      }
    });
    
    // チャットリクエストの実際の処理関数（認証後に呼び出される）
    async function handleChatRequest(req: Request, res: Response) {
      console.log('チャットリクエストの処理を開始します');
      try {
        const { message, type, contextId, previousMessages } = req.body;
        const userId = req.user?.id;
        
        console.log('user情報:', req.user);
        console.log(`ユーザーID: ${userId}`);
        console.log(`メッセージタイプ: ${type || 'なし'}`);
        console.log(`コンテキストID: ${contextId || 'なし'}`);
        console.log(`前のメッセージ数: ${previousMessages?.length || 0}`);
        
        if (!message) {
          console.log('メッセージが空です');
          return res.status(400).json({
            success: false,
            message: 'メッセージを入力してください'
          });
        }
        
        console.log(`ユーザー ${userId} からのメッセージ:`, message);
        
        // システムメッセージビルダーサービスを取得
        const systemMessageBuilder = container.resolve<SystemMessageBuilderService>('SystemMessageBuilderService');
        
        // システムメッセージの準備
        let systemMessage = '';
        
        // Fortune タイプの場合、ユーザーの四柱推命情報を取得
        if (type === 'fortune' && userId) {
          try {
            console.log('四柱推命情報の取得を開始します');
            console.log('====== 直接会話の詳細なシステムメッセージ処理 ======');
            
            // SystemMessageBuilderServiceを使用してシステムメッセージを構築
            const context = await systemMessageBuilder.buildFortuneContextFromUserId(userId);
            
            if (context) {
              // 正常に情報が取得できた場合
              systemMessage = systemMessageBuilder.buildSystemMessage(context);
              console.log('四柱推命情報を含むシステムメッセージを作成しました');
              
              // デバッグログ：常に実際に送信されるシステムメッセージの内容を表示
              console.log('===== 送信される四柱推命システムメッセージ =====');
              console.log(systemMessage);
              console.log('============================================');
            } else {
              // ユーザー情報の取得に失敗した場合のデフォルトメッセージ
              systemMessage = '運勢に関する相談を受け付けます。どのようなことでも相談してください。';
              console.log('ユーザー情報の取得に失敗したため、デフォルトのシステムメッセージを使用します');
            }
          } catch (error) {
            console.error('四柱推命情報の取得中にエラーが発生しました:', error);
            // エラー時のデフォルトメッセージ
            systemMessage = '運勢に関する相談を受け付けます。どのようなことでも相談してください。';
          }
        } else if (type === 'team' && contextId) {
          // チームタイプの場合
          try {
            console.log('チーム情報の取得を開始します');
            console.log('====== チーム会話の詳細なシステムメッセージ処理 ======');
            
            // SystemMessageBuilderServiceを使用してチームシステムメッセージを構築
            const context = await systemMessageBuilder.buildTeamContextFromUserId(userId, contextId);
            
            if (context) {
              // 正常に情報が取得できた場合
              systemMessage = systemMessageBuilder.buildSystemMessage(context);
              console.log('チーム情報を含むシステムメッセージを作成しました');
              
              // デバッグログ：常に実際に送信されるシステムメッセージの内容を表示
              console.log('===== 送信されるチームシステムメッセージ =====');
              console.log(systemMessage);
              console.log('============================================');
            } else {
              // ユーザー情報の取得に失敗した場合のデフォルトメッセージ
              systemMessage = 'チームに関する相談を受け付けます。チームのメンバー構成や目標に関するアドバイスを提供します。';
              console.log('チーム情報の取得に失敗したため、デフォルトのシステムメッセージを使用します');
            }
          } catch (error) {
            console.error('チーム情報の取得中にエラーが発生しました:', error);
            // エラー時のデフォルトメッセージ
            systemMessage = 'チームに関する相談を受け付けます。チームのメンバー構成や目標に関するアドバイスを提供します。';
          }
        } else if (type === 'management' && contextId) {
          // 経営タイプの場合
          try {
            console.log('経営情報の取得を開始します');
            console.log('====== 経営会話の詳細なシステムメッセージ処理 ======');
            
            // SystemMessageBuilderServiceを使用して経営システムメッセージを構築
            const context = await systemMessageBuilder.buildManagementContextFromUserId(userId, contextId);
            
            if (context) {
              // 正常に情報が取得できた場合
              systemMessage = systemMessageBuilder.buildSystemMessage(context);
              console.log('経営情報を含むシステムメッセージを作成しました');
              
              // デバッグログ：常に実際に送信されるシステムメッセージの内容を表示
              console.log('===== 送信される経営システムメッセージ =====');
              console.log(systemMessage);
              console.log('============================================');
            } else {
              // 情報の取得に失敗した場合のデフォルトメッセージ
              systemMessage = '経営管理に関する相談を受け付けます。チーム全体の目標達成や人員配置に関するアドバイスを提供します。';
              console.log('経営情報の取得に失敗したため、デフォルトのシステムメッセージを使用します');
            }
          } catch (error) {
            console.error('経営情報の取得中にエラーが発生しました:', error);
            // エラー時のデフォルトメッセージ
            systemMessage = '経営管理に関する相談を受け付けます。チーム全体の目標達成や人員配置に関するアドバイスを提供します。';
          }
        } else {
          // その他のタイプ
          systemMessage = systemMessageBuilder.buildSystemMessage({
            type: 'fortune', // デフォルトとして運勢タイプを使用
            user: {}
          });
        }
        
        console.log('Claude APIにリクエストを送信します...');
        
        // Claude APIに送信するメッセージを準備
        let apiMessages: Array<{role: string, content: string}> = [];
        
        // 最初にシステムメッセージを追加（必ず最初）
        if (systemMessage) {
          apiMessages.push({ role: 'system', content: systemMessage });
          console.log('システムメッセージを会話履歴の先頭に追加しました');
        }
        
        // 次に前のメッセージを追加
        if (previousMessages && Array.isArray(previousMessages) && previousMessages.length > 0) {
          const formattedPreviousMessages = previousMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
          apiMessages = [...apiMessages, ...formattedPreviousMessages];
          console.log(`前のメッセージ ${previousMessages.length}件を会話履歴に追加しました`);
        }
        
        // 現在のメッセージを追加する前の診断
        console.log('====== メッセージフローを確認します ======');
        console.log(`現在のapiMessagesの長さ: ${apiMessages.length}`);
        console.log(`システムメッセージがある: ${apiMessages.some(m => m.role === 'system') ? 'はい' : 'いいえ'}`);
        if (apiMessages.length > 0 && apiMessages[0].role === 'system') {
          console.log('正常: システムメッセージが先頭にあります');
        } else if (apiMessages.some(m => m.role === 'system')) {
          console.log('警告: システムメッセージが先頭以外にあります - 位置を修正します');
          // システムメッセージを見つけて先頭に移動
          const sysMsg = apiMessages.find(m => m.role === 'system');
          if (sysMsg) {
            const otherMsgs = apiMessages.filter(m => m.role !== 'system');
            apiMessages = [sysMsg, ...otherMsgs];
            console.log('システムメッセージを先頭に移動しました');
          }
        } else if (systemMessage) {
          console.log('情報: システムメッセージを先頭に追加します');
          // システムメッセージを先頭に追加
          apiMessages = [{ role: 'system', content: systemMessage }, ...apiMessages];
        }
        console.log('========================================');
        
        // 現在のメッセージを追加
        apiMessages.push({ role: 'user', content: message });
        
        // APIリクエスト直前に完全なリクエスト内容をログ出力
        console.log('===== Claude APIに送信されるリクエスト =====');
        console.log('モデル:', CLAUDE_MODEL);
        console.log('メッセージ数:', apiMessages.length);
        console.log('システムメッセージ:', systemMessage ? 'あり' : 'なし');
        if (systemMessage) {
          console.log('システムメッセージ内容:');
          console.log(systemMessage);
        }
        console.log('メッセージ内容:');
        apiMessages.forEach((msg, index) => {
          console.log(`[${index}] ${msg.role}: ${msg.content.substring(0, 100)}...`);
        });
        console.log('=======================================');
        
        // 送信されるリクエスト直前の最終チェック
        console.log('====== 実際にClaudeAPIに送信されるリクエスト - 最終確認 ======');
        console.log(`メッセージ総数: ${apiMessages.length}件`);
        console.log('メッセージ内容:');
        apiMessages.forEach((msg, idx) => {
          console.log(`[${idx}] ${msg.role}: ${msg.content.substring(0, 100)}...`);
        });
        
        // システムメッセージがあるか確認
        const hasSystemMessage = apiMessages.some(msg => msg.role === 'system');
        console.log(`システムメッセージ存在: ${hasSystemMessage ? 'あり ✓' : 'なし ✗'}`);
        
        // 地支十神情報があるか確認
        const hasBranchTenGodInfo = apiMessages.some(msg => 
          msg.role === 'system' && msg.content.includes('地支十神関係')
        );
        console.log(`地支十神情報存在: ${hasBranchTenGodInfo ? 'あり ✓' : 'なし ✗'}`);
        console.log('==========================================================');
        
        // Claude APIにリクエストを送信
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
        
        // APIレスポンスのデバッグ情報を記録
        console.log('===== Claude APIからのレスポンス詳細 =====');
        if (response.data && response.data.content) {
          console.log('レスポンスタイプ:', response.data.type);
          console.log('モデル:', response.data.model);
          console.log('ストップ理由:', response.data.stop_reason);
          console.log('入力トークン:', response.data.usage?.input_tokens);
          console.log('出力トークン:', response.data.usage?.output_tokens);
          console.log('APIに送信された内容と実際に処理された内容が一致しているか確認してください');
        }
        console.log('=======================================');
        
        // フロントエンドが期待する形式でレスポンスを構築
        const now = new Date().toISOString();
        const userMessageId = `user-${Date.now()}`;
        const aiMessageId = `ai-${Date.now()}`;
        
        // 会話履歴と新しいメッセージを結合
        const allMessages: Array<{id: string, sender: string, content: any, timestamp: string}> = [];
        
        // 以前のメッセージがあれば追加（既にフォーマットされている想定）
        if (previousMessages && Array.isArray(previousMessages)) {
          allMessages.push(...previousMessages);
        }
        
        // 新しいユーザーメッセージを追加
        const newUserMessage = {
          id: userMessageId,
          sender: 'user',
          content: message,
          timestamp: now
        };
        allMessages.push(newUserMessage);
        
        // 新しいAI応答を追加
        const newAIMessage = {
          id: aiMessageId,
          sender: 'assistant',
          content: aiResponse,
          timestamp: now
        };
        allMessages.push(newAIMessage);
        
        // レスポンスを送信
        console.log('クライアントにレスポンスを送信します');
        return res.json({
          success: true,
          data: {
            messages: allMessages,
            usage: response.data.usage,
            type: type || 'general',
            contextId: contextId || 'default'
          }
        });
      } catch (error) {
        console.error('直接チャットエラー:', error);
        console.error('スタックトレース:', error instanceof Error ? error.stack : '利用不可');
        return res.status(500).json({
          success: false,
          message: 'エラーが発生しました',
          error: error instanceof Error ? error.message : '不明なエラー'
        });
      }
    }
    
    console.log(`直接チャットエンドポイント POST /api/v1/direct-conversations が正常に追加されました`);
    
    // 登録されたルートを確認
    if (app._router && app._router.stack) {
      const routes = app._router.stack
        .filter(layer => layer.route)
        .map(layer => {
          const route = layer.route;
          const methods = Object.keys(route.methods).join(',');
          return `${methods.toUpperCase()} ${route.path}`;
        });
      
      console.log('現在登録されているルート:');
      routes.forEach(route => console.log(`- ${route}`));
    }
    
  } catch (setupError) {
    console.error('直接チャットエンドポイントの設定中にエラーが発生しました:', setupError);
    console.error('スタックトレース:', setupError instanceof Error ? setupError.stack : '利用不可');
  }
  
  console.log('===== 直接チャットエンドポイントの追加処理完了 =====');
}