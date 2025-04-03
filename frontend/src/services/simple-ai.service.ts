/**
 * シンプルAI APIサービス
 * 
 * 複雑な依存関係なしでClaudeAI APIと通信するためのサービス
 */
import axios from 'axios';
import { API_BASE_URL } from '../api/apiConfig';

// エンドポイント定義
const API_ENDPOINTS = {
  CONVERSATIONS: `${API_BASE_URL}/api/v1/simple-ai/conversations`,
  ASK: `${API_BASE_URL}/api/v1/simple-ai/ask`,
  CONVERSATION_BY_ID: (id: string) => `${API_BASE_URL}/api/v1/simple-ai/conversations/${id}`,
  // 直接会話エンドポイント
  DIRECT_CONVERSATIONS: `${API_BASE_URL}/api/v1/direct-conversations`,
};

/**
 * シンプルAI APIサービス
 */
export const SimpleAiService = {
  /**
   * ユーザーの会話一覧を取得
   */
  async getConversations() {
    try {
      const response = await axios.get(API_ENDPOINTS.CONVERSATIONS);
      return response.data;
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
      const response = await axios.get(API_ENDPOINTS.CONVERSATION_BY_ID(conversationId));
      return response.data;
    } catch (error) {
      console.error(`会話ID ${conversationId} の詳細取得に失敗しました:`, error);
      throw error;
    }
  },

  /**
   * 新しい会話を開始、または既存の会話にメッセージを追加
   * @param message ユーザーメッセージ
   * @param conversationId (オプション) 既存の会話ID
   */
  async sendMessage(message: string, conversationId?: string) {
    try {
      const payload: any = { message };
      if (conversationId) {
        payload.conversationId = conversationId;
      }

      const response = await axios.post(API_ENDPOINTS.CONVERSATIONS, payload);
      return response.data;
    } catch (error) {
      console.error('メッセージの送信に失敗しました:', error);
      throw error;
    }
  },

  /**
   * 会話を削除
   * @param conversationId 会話ID
   */
  async deleteConversation(conversationId: string) {
    try {
      const response = await axios.delete(API_ENDPOINTS.CONVERSATION_BY_ID(conversationId));
      return response.data;
    } catch (error) {
      console.error(`会話ID ${conversationId} の削除に失敗しました:`, error);
      throw error;
    }
  },

  /**
   * 単一の質問を送信（会話履歴なし）
   * @param message ユーザーメッセージ
   */
  async ask(message: string) {
    try {
      const response = await axios.post(API_ENDPOINTS.ASK, { message });
      return response.data;
    } catch (error) {
      console.error('質問の送信に失敗しました:', error);
      throw error;
    }
  },
  
  /**
   * 直接会話エンドポイントを使用してメッセージを送信する (実際のClaudeAI呼び出し)
   * @param message メッセージ内容
   * @param type 会話タイプ (fortune, team, member)
   * @param contextId コンテキストID
   * @param previousMessages 前のメッセージの配列（会話履歴）
   * @param streamCallback ストリーミングモード時のコールバック関数
   * @returns 会話データ
   */
  async sendDirectMessage(
    message: string, 
    type?: string, 
    contextId?: string, 
    previousMessages: any[] = [], 
    streamCallback?: (event: string, data: any) => void
  ) {
    // ストリーミングモードが指定されているか確認
    const useStreaming = !!streamCallback;
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log(`直接会話リクエスト: メッセージ=${message.substring(0, 30)}... タイプ=${type || 'なし'}`);
      console.log(`会話履歴: ${previousMessages.length}件`);
      console.log(`ストリーミングモード: ${useStreaming ? '有効' : '無効'}`);
      console.log('リクエスト本文:', { message, type, contextId, previousMessages });
      
      // ストリーミングモードの場合
      if (useStreaming) {
        // streamCallbackを適切なコールバック形式に変換
        const callbacks = {
          onStart: (data: any) => streamCallback('start', data),
          onDelta: (data: any) => streamCallback('delta', data),
          onComplete: (data: any) => streamCallback('complete', data),
          onError: (error: any) => streamCallback('error', { error: typeof error === 'string' ? error : 'ストリーミング中にエラーが発生しました' })
        };
        
        // 既存のsendStreamingDirectMessageメソッドを使用
        return this.sendStreamingDirectMessage(
          message,
          callbacks,
          type,
          contextId,
          previousMessages
        );
      } else {
        // 通常モード（ストリーミングなし）
        const response = await axios.post(
          API_ENDPOINTS.DIRECT_CONVERSATIONS, 
          { message, type, contextId, previousMessages },
          { headers }
        );
        
        console.log('直接会話レスポンスステータス:', response.status);
        console.log('直接会話レスポンスデータ:', JSON.stringify(response.data, null, 2));
        
        return response.data;
      }
    } catch (error) {
      console.error('直接会話エラー:', error);
      throw error;
    }
  },
  
  /**
   * ストリーミングモードで直接会話を送信する
   * @param message メッセージ内容
   * @param callbacks コールバック関数オブジェクト
   * @param type 会話タイプ
   * @param contextId コンテキストID
   * @param previousMessages 前のメッセージの配列
   */
  sendStreamingDirectMessage(
    message: string,
    callbacks: {
      onStart?: (data: any) => void,
      onDelta?: (data: any) => void,
      onComplete?: (data: any) => void,
      onError?: (error: any) => void
    },
    type?: string,
    contextId?: string,
    previousMessages: any[] = []
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
    const url = `${API_ENDPOINTS.DIRECT_CONVERSATIONS}?${params}`;
    
    // POST データの準備
    const postData = {
      message,
      type,
      contextId,
      previousMessages
    };
    
    // リクエストの送信（fetch APIを使用）
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
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
    })
    .catch(error => {
      console.error('ストリーミングリクエストエラー:', error);
      if (callbacks.onError) {
        callbacks.onError(error.message || 'ストリーミング中にエラーが発生しました');
      }
    });
    
    // キャンセル用の関数を返す
    return {
      cancel: () => {
        console.log('ストリーミングリクエストをキャンセルしました');
        // キャンセルの処理は現状は特になし（将来的に必要に応じて実装）
      }
    };
  },
  
  /**
   * 直接会話の履歴を取得する
   * @returns 会話履歴の配列
   */
  async getDirectConversations() {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      console.log('直接会話履歴を取得します');
      
      const response = await axios.get(
        API_ENDPOINTS.DIRECT_CONVERSATIONS,
        { headers }
      );
      
      console.log('直接会話履歴レスポンスステータス:', response.status);
      console.log('直接会話履歴データ数:', response.data?.data?.conversations?.length || 0);
      
      return response.data;
    } catch (error) {
      console.error('直接会話履歴取得エラー:', error);
      throw error;
    }
  },
  
  /**
   * 特定の直接会話履歴を取得する
   * @param conversationId 会話ID
   * @returns 会話履歴
   */
  async getDirectConversationById(conversationId: string) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      console.log(`会話ID ${conversationId} の履歴を取得します`);
      
      const response = await axios.get(
        `${API_ENDPOINTS.DIRECT_CONVERSATIONS}/${conversationId}`,
        { headers }
      );
      
      console.log('直接会話詳細レスポンスステータス:', response.status);
      console.log('直接会話詳細データ:', response.data?.data?.id || 'なし');
      
      return response.data;
    } catch (error) {
      console.error(`会話ID ${conversationId} の詳細取得に失敗しました:`, error);
      throw error;
    }
  },
  
  /**
   * 会話を削除する
   * @param conversationId 会話ID
   * @returns 削除結果
   */
  async deleteDirectConversation(conversationId: string) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      console.log(`会話ID ${conversationId} を削除します`);
      
      const response = await axios.delete(
        `${API_ENDPOINTS.DIRECT_CONVERSATIONS}/${conversationId}`,
        { headers }
      );
      
      console.log('会話削除レスポンスステータス:', response.status);
      console.log('会話削除レスポンスメッセージ:', response.data?.message || 'なし');
      
      return response.data;
    } catch (error) {
      console.error(`会話ID ${conversationId} の削除に失敗しました:`, error);
      throw error;
    }
  }
};

export default SimpleAiService;