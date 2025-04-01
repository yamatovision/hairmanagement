import { getApiUrl } from '../api/apiConfig';
import { CONVERSATION } from '../types';
import { 
  IConversation, 
  IMessage, 
  SendMessageRequest, 
  GeneratePromptQuestionRequest 
} from '../utils/sharedTypes';

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
    
    const response = await fetch(getApiUrl(CONVERSATION.SEND_MESSAGE), {
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
    const token = localStorage.getItem('token');
    
    const response = await fetch(getApiUrl(CONVERSATION.GET_BY_ID(conversationId)), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      // credentials: 'include', // クッキー認証を使用しないため削除
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
}

const conversationService = new ConversationService();
export default conversationService;