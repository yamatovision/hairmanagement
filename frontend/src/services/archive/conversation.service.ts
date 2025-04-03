import { getApiUrl } from '../api/apiConfig';
import { CONVERSATION } from '../types';
import { 
  IConversation, 
  IMessage, 
  SendMessageRequest, 
  GeneratePromptQuestionRequest,
  ConversationType
} from '../utils/sharedTypes';

// バックエンドのベースURL
const BACKEND_URL = 'http://localhost:5001';

// APIエンドポイント定義（完全URL）
const API_ENDPOINTS = {
  SEND_MESSAGE: `${BACKEND_URL}/api/v1/conversation/message`,
  GET_ALL: `${BACKEND_URL}/api/v1/conversation`,
  GET_BY_ID: (id: string) => `${BACKEND_URL}/api/v1/conversation/${id}`,
  GENERATE_PROMPT_QUESTION: `${BACKEND_URL}/api/v1/conversation/generate-prompt`,
  ARCHIVE: (id: string) => `${BACKEND_URL}/api/v1/conversation/${id}/archive`,
  TOGGLE_FAVORITE: (id: string) => `${BACKEND_URL}/api/v1/conversation/${id}/favorite`,
  FORTUNE_CHAT: `${BACKEND_URL}/api/v1/conversation/fortune-chat`,
  TEAM_MEMBER_CHAT: `${BACKEND_URL}/api/v1/conversation/team-member-chat`
};

/**
 * 会話サービス
 * バックエンドの会話APIとの通信を担当
 */
class ConversationService {
  /**
   * メッセージを送信する
   * @param messageData 送信メッセージデータ
   * @returns APIレスポンス（会話情報と最新メッセージ）
   */
  async sendMessage(messageData: SendMessageRequest): Promise<{
    conversation: IConversation;
    lastMessage: IMessage;
  }> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(API_ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
      // credentials: 'include', // クッキー認証を使用しないため削除
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'メッセージの送信に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  /**
   * フォーチュン相談対話を開始
   * @param fortuneId フォーチュンID
   * @returns 新しい会話情報
   */
  async startFortuneChat(fortuneId: string): Promise<any> {
    const token = localStorage.getItem('token');
    
    console.log(`フォーチュン相談対話開始 - フォーチュンID: ${fortuneId}`);
    
    if (!fortuneId) {
      throw new Error('フォーチュンIDが指定されていません。');
    }
    
    // POSTエンドポイントを使用（GETエンドポイントではなく）
    const endpoint = API_ENDPOINTS.FORTUNE_CHAT;
    console.log(`エンドポイント: ${endpoint} に接続しています`);
    
    try {
      // AbortControllerを使用してフェッチに15秒のタイムアウトを設定（サーバータイムアウト対策）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒に延長
      
      console.log(`${new Date().toISOString()} - リクエスト開始 - バックエンドに直接アクセス`);
      const response = await fetch(endpoint, {
        method: 'POST', // POSTメソッドを使用（バックエンドの期待するメソッド）
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fortuneId }), // POSTボディにfortuneIdを含める
        signal: controller.signal
      });
      console.log(`${new Date().toISOString()} - レスポンス受信: status=${response.status}`);
      
      clearTimeout(timeoutId); // 正常に終了したらタイマーをクリア
      
      // タイムアウトの場合は専用のエラーを投げる
      if (response.status === 504) {
        throw new Error('API呼び出しがタイムアウトしました。サーバーが混雑しているか、一時的に利用できない可能性があります。');
      }
      
      // レスポンスが正常な場合のみJSONに変換を試みる
      let data;
      try {
        const responseText = await response.text();
        console.log(`レスポンステキスト (最初の100文字): ${responseText.substring(0, 100)}...`);
        
        if (responseText.trim()) {
          data = JSON.parse(responseText);
          console.log('JSONデータ取得成功:', data);
        } else {
          throw new Error('空のレスポンスを受信しました');
        }
      } catch (jsonError) {
        console.error('JSONパースエラー:', jsonError);
        throw new Error('レスポンスの解析に失敗しました');
      }
      
      console.log('フォーチュン相談APIレスポンス:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'フォーチュン相談の開始に失敗しました');
      }
      
      return data;
    } catch (error: any) {
      console.error('フォーチュン相談API呼び出しエラー:', error);
      
      // AbortControllerによるタイムアウトの場合
      if (error.name === 'AbortError') {
        throw new Error('API呼び出しがタイムアウトしました。サーバーの応答時間が長すぎます。');
      }
      
      // その他のエラーはそのまま投げる（呼び出し元で処理）
      throw error;
    }
  }
  
  /**
   * すべての会話履歴を取得する
   * @param options 取得オプション（ページネーション、アーカイブフィルタなど）
   * @returns 会話リストとページネーション情報
   */
  async getAllConversations(options?: {
    page?: number;
    limit?: number;
    isArchived?: boolean;
  }): Promise<{
    conversations: IConversation[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const token = localStorage.getItem('token');
    
    // クエリパラメータを構築
    const queryParams = new URLSearchParams();
    if (options?.page) queryParams.append('page', options.page.toString());
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.isArchived !== undefined) queryParams.append('archived', options.isArchived.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(getApiUrl(`${CONVERSATION.GET_ALL}${queryString}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      // credentials: 'include', // クッキー認証を使用しないため削除
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '会話履歴の取得に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  /**
   * 特定の会話を取得する
   * @param conversationId 会話ID
   * @returns 会話情報
   */
  async getConversationById(conversationId: string): Promise<IConversation> {
    // conversationIdが "fortune" またはURLパラメータのような特殊形式の場合は処理しない
    if (!conversationId || conversationId === 'fortune' || conversationId.includes('?')) {
      console.warn('無効な会話ID:', conversationId);
      throw new Error('無効な会話IDが指定されました');
    }
    
    // フォーチュン相談ページかどうか確認
    if (window.location.pathname.includes('/conversation') && window.location.search.includes('fortuneId=')) {
      throw new Error('フォーチュン相談ページでの無効なAPI呼び出しです');
    }
    
    const token = localStorage.getItem('token');
    
    const response = await fetch(getApiUrl(CONVERSATION.GET_BY_ID(conversationId)), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '会話の取得に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  /**
   * 呼び水質問を生成する
   * @param requestData 質問生成リクエストデータ
   * @returns 生成された質問情報
   */
  async generatePromptQuestion(requestData: GeneratePromptQuestionRequest): Promise<{
    questionId: string;
    content: string;
    category: string;
    timestamp: string;
  }> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(getApiUrl(CONVERSATION.GENERATE_PROMPT_QUESTION), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
      // credentials: 'include', // クッキー認証を使用しないため削除
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '呼び水質問の生成に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  /**
   * 会話をアーカイブする
   * @param conversationId 会話ID
   * @returns 更新された会話情報
   */
  async archiveConversation(conversationId: string): Promise<IConversation> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(getApiUrl(CONVERSATION.ARCHIVE(conversationId)), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      // credentials: 'include', // クッキー認証を使用しないため削除
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '会話のアーカイブに失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
  
  /**
   * メッセージをお気に入り登録/解除する
   * @param conversationId 会話ID
   * @param messageId メッセージID
   * @returns お気に入り状態
   */
  async toggleFavoriteMessage(conversationId: string, messageId: string): Promise<{
    messageId: string;
    isFavorite: boolean;
  }> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(getApiUrl(CONVERSATION.TOGGLE_FAVORITE(conversationId)), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ messageId }),
      // credentials: 'include', // クッキー認証を使用しないため削除
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'お気に入り登録に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }

  /**
   * チーム目標コンサルティング対話を開始する
   * @param teamId チームID
   * @param initialMessage 初期メッセージ
   * @returns 会話情報と最初のメッセージ
   */
  async startTeamConsultation(teamId: string, initialMessage: string): Promise<{
    conversation: IConversation;
    lastMessage: IMessage;
  }> {
    const token = localStorage.getItem('token');
    
    const messageData: SendMessageRequest = {
      content: initialMessage,
      conversationType: ConversationType.TEAM_CONSULTATION,
      metadata: { teamId }
    };
    
    const response = await fetch(getApiUrl(CONVERSATION.SEND_MESSAGE), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'チーム目標コンサルティングの開始に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  }
}

const conversationService = new ConversationService();
export default conversationService;