/**
 * 直接Claude AIと通信するためのシンプルなエンドポイント実装
 * 詳細なログ付き
 */

import axios from 'axios';
import { Express, Request, Response } from 'express';
import { container } from 'tsyringe';
import { AuthMiddleware } from './interfaces/http/middlewares/auth.middleware';

/**
 * 直接チャットエンドポイントをアプリケーションに追加
 */
export function addDirectChatEndpoint(app: Express): void {
  console.log('===== 直接チャットエンドポイントの追加処理開始 =====');
  
  try {
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
    console.log('Express appが有効か確認:', app ? 'OK' : 'エラー - appがnullまたはundefined');
    console.log('Express appのメソッド:', Object.keys(app).join(', '));
    
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
        console.log('Claude APIにリクエストを送信します...');
        
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
        
        // フロントエンドが期待する形式でレスポンスを構築
        const now = new Date().toISOString();
        const userMessageId = `user-${Date.now()}`;
        const aiMessageId = `ai-${Date.now()}`;
        
        // 会話履歴と新しいメッセージを結合
        const allMessages = [];
        
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