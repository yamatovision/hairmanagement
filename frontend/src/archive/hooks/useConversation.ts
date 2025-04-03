import { useState, useCallback, useEffect } from 'react';
import conversationService from '../services/conversation.service';

/**
 * トースト通知用のカスタムフック（モック実装）
 */
export const useToast = () => {
  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    console.log(`[Toast] ${severity}: ${message}`);
    // 実際のアプリケーションではスナックバーやトースト通知を表示
  };
  
  return { showToast };
};

/**
 * 会話管理カスタムフック - 拡張された実装
 */
export const useConversation = (initialConversationId?: string) => {
  const [conversation, setConversation] = useState<any | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  
  const { showToast } = useToast();
  
  /**
   * 会話を開始または継続する
   * @param type 会話タイプ（'fortune', 'team', 'member'）
   * @param contextId 関連するコンテキストID
   */
  const startConversation = useCallback(async (type: string, contextId: string) => {
    try {
      setIsLoading(true);
      
      const result = await conversationService.startConversation(type, contextId);
      
      setConversation(result);
      setMessages(result.messages || []);
      
      return result;
    } catch (error) {
      console.error('会話開始エラー:', error);
      showToast('会話の開始に失敗しました', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);
  
  /**
   * メッセージを送信する
   * @param content メッセージ内容
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!conversation || !conversation.id) {
      showToast('アクティブな会話がありません', 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 画面に即時反映するためのユーザーメッセージ
      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        sender: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      
      // メッセージリストに追加
      setMessages(prevMessages => [...prevMessages, tempUserMessage]);
      
      // APIを呼び出してメッセージを送信
      const result = await conversationService.sendMessage(conversation.id, content);
      
      if (result && result.message) {
        // AI応答を追加
        setMessages(prevMessages => [...prevMessages, result.message]);
      }
      
      return result;
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      showToast('メッセージの送信に失敗しました', 'error');
      
      // エラー時は追加したユーザーメッセージを削除
      setMessages(prevMessages => prevMessages.filter(msg => !msg.id.startsWith('temp-')));
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [conversation, showToast]);
  
  /**
   * 会話をダウンロードする
   */
  const downloadConversation = useCallback(() => {
    if (!conversation) {
      showToast('ダウンロードする会話がありません', 'error');
      return;
    }
    
    try {
      conversationService.downloadConversation({
        ...conversation,
        messages
      });
      
      showToast('会話を保存しました', 'success');
    } catch (error) {
      console.error('会話ダウンロードエラー:', error);
      showToast('会話の保存に失敗しました', 'error');
    }
  }, [conversation, messages, showToast]);

  /**
   * 会話のリストを取得
   */
  const fetchConversations = useCallback(async (options?: { 
    page?: number; 
    limit?: number; 
    isArchived?: boolean 
  }) => {
    try {
      setIsLoading(true);
      
      // MockやAPIインターフェースの仮実装
      // 実際のプロダクション実装ではAPI呼び出しに置き換え
      const result = {
        conversations: [],
        pagination: {
          total: 0,
          page: options?.page || 1,
          limit: options?.limit || 10,
          totalPages: 0
        }
      };
      
      setConversations(result.conversations);
      setPagination(result.pagination);
      return result;
    } catch (error) {
      console.error('会話履歴取得エラー:', error);
      showToast('会話履歴の取得に失敗しました', 'error');
      return { conversations: [], pagination: null };
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);
  
  /**
   * 会話をアーカイブする
   */
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      // モック実装
      showToast('会話をアーカイブしました', 'success');
      // 会話リストを更新
      setConversations(prevConversations => 
        prevConversations.filter(conv => conv.id !== conversationId)
      );
      return true;
    } catch (error) {
      console.error('会話アーカイブエラー:', error);
      showToast('会話のアーカイブに失敗しました', 'error');
      return false;
    }
  }, [showToast]);

  /**
   * 呼び水質問を生成
   */
  const generatePromptQuestion = useCallback(async (requestData: any) => {
    try {
      setIsLoading(true);
      
      // モック実装
      const result = {
        content: "今日はどのような課題に取り組んでいますか？",
        category: requestData.category || "growth"
      };
      
      return result;
    } catch (error) {
      console.error('呼び水質問生成エラー:', error);
      showToast('呼び水質問の生成に失敗しました', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  /**
   * チーム目標コンサルティング対話を開始
   */
  const startTeamConsultation = useCallback(async (teamId: string, initialMessage: string) => {
    try {
      setIsLoading(true);
      
      // 新しい会話を開始
      const result = await startConversation('team', teamId);
      
      // 初期メッセージを送信
      if (result && result.id) {
        await sendMessage(initialMessage);
      }
      
      return { conversation: result };
    } catch (error) {
      console.error('チーム目標コンサルティング開始エラー:', error);
      showToast('チーム目標コンサルティングの開始に失敗しました', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast, startConversation, sendMessage]);

  // 初期会話IDが提供された場合は会話を読み込む
  useEffect(() => {
    if (initialConversationId) {
      // 会話取得のロジックはここに実装
    }
  }, [initialConversationId]);
  
  return {
    conversation,
    conversations,
    messages,
    isLoading,
    pagination,
    startConversation,
    sendMessage,
    downloadConversation,
    fetchConversations,
    archiveConversation,
    generatePromptQuestion,
    startTeamConsultation
  };
};