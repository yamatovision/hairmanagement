/**
 * 会話サービス - シンプル化された実装
 * バックエンドのAPI呼び出しを担当
 */

// APIのベースURL
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL || 'https://patrolmanagement-backend-235426778039.asia-northeast1.run.app'
  : 'http://localhost:5001';

// APIエンドポイント
const API_ENDPOINTS = {
  // メインエンドポイント
  CONVERSATIONS: `${API_BASE_URL}/api/v1/conversations`,
  MESSAGES: (id: string) => `${API_BASE_URL}/api/v1/conversations/${id}/messages`,
  CONVERSATION_BY_ID: (id: string) => `${API_BASE_URL}/api/v1/conversations/${id}`
};

/**
 * 会話サービスクラス
 */
class ConversationService {
  /**
   * 会話を開始または継続する
   * @param type 会話タイプ（'fortune', 'team', 'member'）
   * @param contextId 関連するコンテキストID
   * @returns 会話データ
   */
  async startConversation(type: string, contextId: string): Promise<any> {
    const token = localStorage.getItem('token');
    
    console.log(`会話開始リクエスト: type=${type}, contextId=${contextId}`);
    console.log(`使用するエンドポイント: ${API_ENDPOINTS.CONVERSATIONS}`);
    
    try {
      const response = await fetch(API_ENDPOINTS.CONVERSATIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, contextId })
      });
      
      console.log(`レスポンスステータス: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorMessage = '会話の開始に失敗しました';
        
        try {
          const errorData = await response.json();
          console.error('エラーレスポンス:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('レスポンスのパースに失敗:', parseError);
        }
        
        if (response.status === 404) {
          errorMessage = 'エンドポイントが見つかりません。サーバーが起動しているか確認してください。';
        } else if (response.status === 401) {
          errorMessage = '認証エラー: 再ログインしてください。';
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('会話開始レスポンス:', data);
      
      return data.data;
    } catch (error) {
      console.error('会話開始エラー:', error);
      throw error;
    }
  }
  
  /**
   * 会話にメッセージを送信する
   * @param conversationId 会話ID
   * @param content メッセージ内容
   * @returns 新しいメッセージデータ
   */
  async sendMessage(conversationId: string, content: string): Promise<any> {
    const token = localStorage.getItem('token');
    
    console.log(`メッセージ送信リクエスト: conversationId=${conversationId}`);
    
    try {
      const response = await fetch(API_ENDPOINTS.MESSAGES(conversationId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'メッセージの送信に失敗しました');
      }
      
      const data = await response.json();
      console.log('メッセージ送信レスポンス:', data);
      
      return data.data;
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      throw error;
    }
  }
  
  /**
   * 会話の詳細を取得する
   * @param conversationId 会話ID
   * @returns 会話データ
   */
  async getConversationById(conversationId: string): Promise<any> {
    const token = localStorage.getItem('token');
    
    console.log(`会話詳細取得リクエスト: conversationId=${conversationId}`);
    
    try {
      const response = await fetch(API_ENDPOINTS.CONVERSATION_BY_ID(conversationId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '会話の取得に失敗しました');
      }
      
      const data = await response.json();
      console.log('会話詳細レスポンス:', data);
      
      return data.data;
    } catch (error) {
      console.error('会話詳細取得エラー:', error);
      throw error;
    }
  }
  
  /**
   * 会話データをJSONとしてダウンロードする
   * @param conversation 会話データ
   */
  downloadConversation(conversation: any): void {
    // 会話データをJSONに変換
    const conversationData = {
      type: conversation.type,
      date: new Date().toISOString().split('T')[0],
      messages: conversation.messages.map((msg: any) => ({
        role: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    };
    
    // JSONファイルとしてダウンロード
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// シングルトンインスタンスをエクスポート
const conversationService = new ConversationService();
export default conversationService;