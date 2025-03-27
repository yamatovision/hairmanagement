import { useState, useCallback, useEffect } from 'react';
import { 
  IMessage, 
  IConversation, 
  SendMessageRequest, 
  GeneratePromptQuestionRequest 
} from '../utils/sharedTypes';
import { conversationService } from '../services/conversation.service';

// トースト通知のカスタムフック（モック実装）
export const useToast = () => {
  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    console.log(`[Toast] ${severity}: ${message}`);
    // 実際のアプリケーションでは、スナックバーやトースト通知を表示
  };
  
  return { showToast };
};

// 会話のカスタムフック - 会話機能全体を管理
export const useConversation = (initialConversationId?: string) => {
  const [currentConversation, setCurrentConversation] = useState<IConversation | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  
  const { showToast } = useToast();
  
  // メッセージを送信
  const sendMessage = useCallback(async (content: string, context?: any) => {
    try {
      setIsLoading(true);
      
      // タイムスタンプを生成
      const timestamp = new Date().toISOString();
      
      // 仮メッセージを表示（オプティミスティックUI）
      const tempUserMessage: IMessage = {
        id: `temp-${timestamp}`,
        sender: 'user',
        content,
        timestamp
      };
      
      setMessages(prevMessages => [...prevMessages, tempUserMessage]);
      
      // API呼び出し
      const requestData: SendMessageRequest = {
        conversationId: currentConversation?.id,
        content,
        context
      };
      
      const result = await conversationService.sendMessage(requestData);
      
      // 会話オブジェクトとメッセージを更新
      setCurrentConversation(result.conversation);
      setMessages(result.conversation.messages);
      
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      showToast('メッセージの送信に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, showToast]);
  
  // 会話のリストを取得
  const fetchConversations = useCallback(async (options?: { 
    page?: number; 
    limit?: number; 
    isArchived?: boolean 
  }) => {
    try {
      setIsLoading(true);
      
      const result = await conversationService.getAllConversations(options);
      
      setConversations(result.conversations);
      setPagination(result.pagination);
    } catch (error) {
      console.error('会話履歴取得エラー:', error);
      showToast('会話履歴の取得に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);
  
  // 特定の会話を取得
  const getConversationById = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      
      const conversation = await conversationService.getConversationById(conversationId);
      
      setCurrentConversation(conversation);
      setMessages(conversation.messages);
      
      return conversation;
    } catch (error) {
      console.error('会話取得エラー:', error);
      showToast('会話の取得に失敗しました', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);
  
  // 呼び水質問を生成
  const generatePromptQuestion = useCallback(async (requestData: GeneratePromptQuestionRequest) => {
    try {
      const result = await conversationService.generatePromptQuestion(requestData);
      return result;
    } catch (error) {
      console.error('呼び水質問生成エラー:', error);
      showToast('呼び水質問の生成に失敗しました', 'error');
      throw error;
    }
  }, [showToast]);
  
  // 会話をアーカイブ
  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      await conversationService.archiveConversation(conversationId);
      
      // 会話リストを更新
      setConversations(prevConversations => 
        prevConversations.filter(conv => conv.id !== conversationId)
      );
      
      showToast('会話をアーカイブしました', 'success');
    } catch (error) {
      console.error('会話アーカイブエラー:', error);
      showToast('会話のアーカイブに失敗しました', 'error');
    }
  }, [showToast]);
  
  // メッセージをお気に入り登録
  const favoriteMessage = useCallback(async (messageId: string) => {
    try {
      if (!currentConversation) return;
      
      const result = await conversationService.toggleFavoriteMessage(
        currentConversation.id, 
        messageId
      );
      
      // メッセージの状態を更新
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === messageId 
            ? { ...message, isFavorite: result.isFavorite } 
            : message
        )
      );
      
      showToast(
        result.isFavorite ? 'メッセージをお気に入りに追加しました' : 'お気に入りを解除しました',
        'success'
      );
    } catch (error) {
      console.error('お気に入り登録エラー:', error);
      showToast('お気に入り操作に失敗しました', 'error');
    }
  }, [currentConversation, showToast]);
  
  // 初期会話IDが提供された場合は会話を読み込む
  useEffect(() => {
    if (initialConversationId) {
      getConversationById(initialConversationId);
    }
  }, [initialConversationId, getConversationById]);
  
  return {
    currentConversation,
    conversations,
    messages,
    isLoading,
    pagination,
    sendMessage,
    fetchConversations,
    getConversationById,
    generatePromptQuestion,
    archiveConversation,
    favoriteMessage
  };
};