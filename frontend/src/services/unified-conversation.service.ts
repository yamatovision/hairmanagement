/**
 * 統合会話 APIサービス
 * 
 * 統合された会話システムへのアクセスを提供するサービス
 * 直接会話とシンプルAI会話の両方の機能を統合
 */
import axios from 'axios';
import { API_BASE_URL } from '../api/apiConfig';

// エンドポイント定義
const API_ENDPOINTS = {
  UNIFIED_CONVERSATIONS: `${API_BASE_URL}/api/v1/unified-conversations`,
  UNIFIED_CONVERSATION_BY_ID: (id: string) => `${API_BASE_URL}/api/v1/unified-conversations/${id}`,
  LEGACY_DIRECT_CONVERSATIONS: `${API_BASE_URL}/api/v1/direct-conversations`,
};

// ストリーミングコールバックのインターフェース
export interface StreamingCallbacks {
  onStart?: (data: any) => void;
  onDelta?: (data: any) => void;
  onComplete?: (data: any) => void;
  onError?: (error: any) => void;
}

// 会話オプションのインターフェース
export interface ConversationOptions {
  includeUserContext?: boolean;
  includeElementalProfile?: boolean;
  includeSajuProfile?: boolean;
  [key: string]: any;
}

/**
 * 統合会話 APIサービス
 */
export const UnifiedConversationService = {
  /**
   * ユーザーの会話一覧を取得
   */
  async getConversations() {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // 統合APIを試す
      try {
        const response = await axios.get(API_ENDPOINTS.UNIFIED_CONVERSATIONS, { headers });
        console.log('統合会話一覧を取得しました');
        return response.data;
      } catch (unifiedError) {
        console.warn('統合APIに接続できませんでした。レガシーAPIにフォールバックします:', unifiedError);
        
        // レガシーAPIにフォールバック
        const legacyResponse = await axios.get(API_ENDPOINTS.LEGACY_DIRECT_CONVERSATIONS, { headers });
        return legacyResponse.data;
      }
    } catch (error) {
      console.error('会話一覧の取得に失敗しました:', error);
      throw error;
    }
  },

  /**
   * 特定の会話の詳細を取得
   * @param conversationId 会話ID
   */
  async getConversationById(conversationId: string) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      // 統合APIを試す
      try {
        const response = await axios.get(
          API_ENDPOINTS.UNIFIED_CONVERSATION_BY_ID(conversationId), 
          { headers }
        );
        console.log('統合会話詳細を取得しました');
        return response.data;
      } catch (unifiedError) {
        console.warn('統合APIに接続できませんでした。レガシーAPIにフォールバックします:', unifiedError);
        
        // レガシーAPIにフォールバック
        const legacyResponse = await axios.get(
          `${API_ENDPOINTS.LEGACY_DIRECT_CONVERSATIONS}/${conversationId}`,
          { headers }
        );
        return legacyResponse.data;
      }
    } catch (error) {
      console.error(`会話ID ${conversationId} の詳細取得に失敗しました:`, error);
      throw error;
    }
  },

  /**
   * 新しい会話を初期化する
   * @param type 会話タイプ (fortune, team, member)
   * @param contextId 関連付けるコンテキストID
   * @param options 追加オプション
   */
  async initializeConversation(type?: string, contextId?: string, options: ConversationOptions = {}) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      const payload = { type, contextId, options };
      console.log('会話初期化リクエスト:', payload);
      
      // 統合APIを試す
      try {
        const response = await axios.post(
          API_ENDPOINTS.UNIFIED_CONVERSATIONS, 
          payload,
          { headers }
        );
        console.log('統合会話を初期化しました');
        return response.data;
      } catch (unifiedError) {
        console.warn('統合APIに接続できませんでした。レガシーAPIにフォールバックします:', unifiedError);
        
        // レガシーAPIにフォールバック - 互換性のため空リクエストを送信
        const legacyResponse = await axios.post(
          API_ENDPOINTS.LEGACY_DIRECT_CONVERSATIONS,
          { message: '', type, contextId },
          { headers }
        );
        return legacyResponse.data;
      }
    } catch (error) {
      console.error('会話の初期化に失敗しました:', error);
      throw error;
    }
  },

  /**
   * メッセージを送信する（統合および従来のAPIをサポート）
   * @param message メッセージ内容
   * @param type 会話タイプ (fortune, team, member)
   * @param contextId コンテキストID
   * @param previousMessages 前のメッセージの配列（会話履歴）
   * @param options 追加オプション
   */
  async sendMessage(
    message: string, 
    type?: string, 
    contextId?: string, 
    previousMessages: any[] = [],
    options: ConversationOptions = {}
  ) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log(`メッセージ送信: ${message.substring(0, 30)}... タイプ=${type || 'なし'}`);
      console.log(`会話履歴: ${previousMessages.length}件`);
      
      const payload = { 
        message, 
        type, 
        contextId, 
        previousMessages,
        options
      };
      
      // 統合APIを試す
      try {
        const response = await axios.post(
          `${API_ENDPOINTS.UNIFIED_CONVERSATIONS}/messages`, 
          payload,
          { headers }
        );
        console.log('統合会話APIでメッセージを送信しました');
        return response.data;
      } catch (unifiedError) {
        console.warn('統合APIに接続できませんでした。レガシーAPIにフォールバックします:', unifiedError);
        
        // レガシーAPIにフォールバック
        const legacyResponse = await axios.post(
          API_ENDPOINTS.LEGACY_DIRECT_CONVERSATIONS, 
          { message, type, contextId, previousMessages },
          { headers }
        );
        return legacyResponse.data;
      }
    } catch (error) {
      console.error('メッセージの送信に失敗しました:', error);
      throw error;
    }
  },
  
  /**
   * ストリーミングモードでメッセージを送信する
   * @param message メッセージ内容
   * @param callbacks コールバック関数オブジェクト
   * @param type 会話タイプ
   * @param contextId コンテキストID
   * @param previousMessages 前のメッセージの配列
   * @param options 追加オプション
   */
  sendStreamingMessage(
    message: string,
    callbacks: StreamingCallbacks,
    type?: string,
    contextId?: string,
    previousMessages: any[] = [],
    options: ConversationOptions = {}
  ) {
    // トークンの取得
    const token = localStorage.getItem('token');
    if (!token) {
      if (callbacks.onError) {
        callbacks.onError('認証トークンがありません');
      }
      return null;
    }
    
    // クエリパラメータ
    const params = new URLSearchParams({ stream: 'true' });
    
    // 統合APIのURLを設定
    const unifiedUrl = `${API_ENDPOINTS.UNIFIED_CONVERSATIONS}/messages?${params}`;
    
    // レガシーAPIのURLを設定（フォールバック用）
    const legacyUrl = `${API_ENDPOINTS.LEGACY_DIRECT_CONVERSATIONS}?${params}`;
    
    // POSTデータの準備
    const postData = {
      message,
      type,
      contextId,
      previousMessages,
      options
    };
    
    // レガシーAPIデータ形式（フォールバック用）
    const legacyPostData = {
      message,
      type,
      contextId,
      previousMessages
    };
    
    // 統合APIまたはレガシーAPIを使用するための関数
    const startStreaming = (url: string, data: any) => {
      // リクエストの送信（fetch APIを使用）
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('レスポンスからリーダーを取得できませんでした');
        }
        
        // 受信したテキスト全体
        let receivedText = '';
        
        // テキストデコーダー
        const decoder = new TextDecoder();
        
        // データの読み取り処理
        function processStream({ done, value }: ReadableStreamReadResult<Uint8Array>) {
          if (done) {
            console.log('ストリーム読み取り完了');
            return;
          }
          
          // バイナリデータをテキストに変換
          const chunk = decoder.decode(value, { stream: true });
          receivedText += chunk;
          
          // SSEイベントに分割
          const events = receivedText.split('\n\n');
          receivedText = events.pop() || '';
          
          // 各イベントを処理
          for (const eventText of events) {
            const lines = eventText.split('\n');
            let eventType = '';
            let eventData = '';
            
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.replace('event:', '').trim();
              } else if (line.startsWith('data:')) {
                eventData = line.replace('data:', '').trim();
              }
            }
            
            if (eventType && eventData) {
              try {
                const parsedData = JSON.parse(eventData);
                
                // イベントタイプに応じたコールバックを呼び出す
                if (eventType === 'start' && callbacks.onStart) {
                  callbacks.onStart(parsedData);
                } else if (eventType === 'delta' && callbacks.onDelta) {
                  callbacks.onDelta(parsedData);
                } else if (eventType === 'complete' && callbacks.onComplete) {
                  callbacks.onComplete(parsedData);
                } else if (eventType === 'error' && callbacks.onError) {
                  callbacks.onError(parsedData);
                }
              } catch (e) {
                console.error('ストリーミングデータのパースエラー:', e);
                if (callbacks.onError) {
                  callbacks.onError('データのパースエラー');
                }
              }
            }
          }
          
          // 次のデータチャンクを読み取り
          reader.read().then(processStream);
        }
        
        // ストリーム読み取り開始
        reader.read().then(processStream);
        
        return { reader };
      });
    };
    
    // まず統合APIを試す
    console.log('統合API経由でストリーミングリクエストを開始します');
    
    let readerRef: any = null;
    
    startStreaming(unifiedUrl, postData)
      .then(({ reader }) => {
        console.log('統合APIストリーミング確立');
        readerRef = reader;
      })
      .catch(error => {
        console.warn('統合APIストリーミングに失敗しました。レガシーAPIにフォールバックします:', error);
        
        // 統合APIが失敗した場合、レガシーAPIにフォールバック
        startStreaming(legacyUrl, legacyPostData)
          .then(({ reader }) => {
            console.log('レガシーAPIストリーミング確立');
            readerRef = reader;
          })
          .catch(legacyError => {
            console.error('ストリーミングリクエスト失敗（両方のAPI）:', legacyError);
            if (callbacks.onError) {
              callbacks.onError(legacyError.message || 'ストリーミング中にエラーが発生しました');
            }
          });
      });
    
    // キャンセル用の関数を返す
    return {
      cancel: () => {
        console.log('ストリーミングリクエストをキャンセルします');
        if (readerRef) {
          try {
            readerRef.cancel('ユーザーによるキャンセル');
            console.log('ストリーミングがキャンセルされました');
          } catch (e) {
            console.error('ストリーミングキャンセルエラー:', e);
          }
        }
      }
    };
  },
  
  /**
   * 会話を削除する
   * @param conversationId 会話ID
   */
  async deleteConversation(conversationId: string) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      console.log(`会話ID ${conversationId} を削除します`);
      
      // 統合APIを試す
      try {
        const response = await axios.delete(
          API_ENDPOINTS.UNIFIED_CONVERSATION_BY_ID(conversationId),
          { headers }
        );
        console.log('統合APIで会話を削除しました');
        return response.data;
      } catch (unifiedError) {
        console.warn('統合APIに接続できませんでした。レガシーAPIにフォールバックします:', unifiedError);
        
        // レガシーAPIにフォールバック
        const legacyResponse = await axios.delete(
          `${API_ENDPOINTS.LEGACY_DIRECT_CONVERSATIONS}/${conversationId}`,
          { headers }
        );
        return legacyResponse.data;
      }
    } catch (error) {
      console.error(`会話ID ${conversationId} の削除に失敗しました:`, error);
      throw error;
    }
  }
};

export default UnifiedConversationService;