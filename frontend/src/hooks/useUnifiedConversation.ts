import { useState, useCallback, useEffect } from 'react';
import UnifiedConversationService, { StreamingCallbacks, ConversationOptions } from '../services/unified-conversation.service';

/**
 * 統合会話システム用のフック
 * 統一された会話インターフェースを提供し、新旧のAPIを透過的にサポート
 */
export const useUnifiedConversation = (initialContextId?: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [type, setType] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  // トースト通知の簡易実装
  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    console.log(`[Toast] ${severity}: ${message}`);
  };
  
  // 初回マウント時に会話履歴を取得
  useEffect(() => {
    // 初期contextIdが指定されている場合は、その会話を取得
    if (initialContextId && initialContextId !== 'default') {
      loadConversation(initialContextId);
    } else {
      // すべての会話履歴を取得
      loadAllConversations();
    }
  }, [initialContextId]);
  
  /**
   * すべての会話履歴を取得する
   */
  const loadAllConversations = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      setError(null);
      
      const result = await UnifiedConversationService.getConversations();
      
      if (result && result.data && result.data.conversations) {
        setAllConversations(result.data.conversations);
      }
    } catch (error: any) {
      console.error('会話履歴取得エラー:', error);
      setError(error.message || '会話履歴の取得に失敗しました');
      showToast('会話履歴の取得に失敗しました', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);
  
  /**
   * 特定の会話履歴を取得する
   */
  const loadConversation = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await UnifiedConversationService.getConversationById(id);
      
      if (result && result.data) {
        setMessages(result.data.messages || []);
        setConversationId(result.data.id || id);
        if (result.data.type) {
          setType(result.data.type);
        }
      }
    } catch (error: any) {
      console.error(`会話ID ${id} の取得に失敗しました:`, error);
      setError(error.message || '会話履歴の取得に失敗しました');
      showToast('会話履歴の取得に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * 会話を削除する
   */
  const deleteConversation = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await UnifiedConversationService.deleteConversation(id);
      
      // 削除が成功したら、会話リストから削除
      setAllConversations(prev => prev.filter(conv => conv.id !== id));
      
      // 現在表示中の会話だった場合はクリア
      if (conversationId === id) {
        setMessages([]);
        setConversationId(null);
      }
      
      showToast('会話を削除しました', 'success');
    } catch (error: any) {
      console.error(`会話ID ${id} の削除に失敗しました:`, error);
      setError(error.message || '会話の削除に失敗しました');
      showToast('会話の削除に失敗しました', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);
  
  /**
   * 会話を開始する
   */
  const startConversation = useCallback(async (
    conversationType?: string, 
    contextId?: string,
    options: ConversationOptions = {}
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 会話タイプを保存
      if (conversationType) {
        setType(conversationType);
      }
      
      // 特定の会話が指定されている場合はその会話を読み込む
      if (contextId && contextId !== 'default') {
        await loadConversation(contextId);
        return { id: contextId, type: conversationType, contextId };
      }
      
      // 新しい会話を開始
      const result = await UnifiedConversationService.initializeConversation(
        conversationType, 
        contextId, 
        options
      );
      
      // 応答をチェック
      if (result && result.data) {
        // 既存のメッセージがある場合は設定
        if (result.data.messages && Array.isArray(result.data.messages) && result.data.messages.length > 0) {
          setMessages(result.data.messages);
        } else {
          // 新規会話の場合は空の配列
          setMessages([]);
        }
        
        // 会話IDを保存
        if (result.data.id || result.data.contextId) {
          setConversationId(result.data.id || result.data.contextId);
        }
      } else {
        // 応答がない場合は空の配列
        setMessages([]);
        setConversationId(null);
      }
      
      return result?.data || { id: null, type: conversationType, contextId: 'default' };
    } catch (error: any) {
      console.error('会話初期化エラー:', error);
      setError(error.message || '会話の初期化に失敗しました');
      showToast('会話の初期化に失敗しました', 'error');
      setMessages([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadConversation]);
  
  /**
   * メッセージを送信する
   * @param content メッセージ内容
   * @param useStreaming ストリーミングモードを使用するかどうか
   * @param overrideType メッセージ送信時に使用する会話タイプを上書き指定（オプション）
   * @param options 追加オプション
   */
  const sendMessage = useCallback(async (
    content: string, 
    useStreaming: boolean = true, 
    overrideType?: string,
    options: ConversationOptions = {}
  ) => {
    if (!content.trim()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 使用する会話タイプを決定
      const messageType = overrideType || type;
      
      // 画面に即時反映するためのユーザーメッセージ
      const tempUserMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      
      // 現在のメッセージ履歴を取得（一時メッセージを除く）
      const currentMessages = messages.filter(msg => !msg.id.startsWith('temp-'));
      
      // メッセージリストに追加
      setMessages(prevMessages => [...prevMessages, tempUserMessage]);
      
      // ストリーミングモードの場合
      if (useStreaming) {
        // AI応答用の仮メッセージを追加
        const tempAiMessageId = `ai-temp-${Date.now()}`;
        const tempAiMessage = {
          id: tempAiMessageId,
          sender: 'assistant',
          content: '',
          timestamp: new Date().toISOString()
        };
        
        // ユーザーメッセージに続けてAI応答用の枠を追加
        setMessages(prevMessages => [...prevMessages, tempAiMessage]);
        
        // ストリーミングコールバックの設定
        const streamingCallbacks: StreamingCallbacks = {
          // 開始時のコールバック
          onStart: (data) => {
            console.log('ストリーミング開始:', data);
            // ストリーミングが開始したらローディング状態を解除
            setIsLoading(false);
            // 会話IDを保存
            if (data?.data?.contextId) {
              setConversationId(data.data.contextId);
            }
          },
          
          // デルタ（テキストチャンク）のコールバック
          onDelta: (data) => {
            const textDelta = data?.data?.delta || '';
            
            // メッセージリストのAI応答を更新
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages];
              const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === tempAiMessageId);
              
              if (aiMessageIndex !== -1) {
                // 既存のメッセージにテキストを追加
                updatedMessages[aiMessageIndex] = {
                  ...updatedMessages[aiMessageIndex],
                  content: updatedMessages[aiMessageIndex].content + textDelta
                };
              }
              
              return updatedMessages;
            });
          },
          
          // 完了時のコールバック
          onComplete: async (data) => {
            console.log('ストリーミング完了:', data);
            // 会話リストを更新
            await loadAllConversations();
            
            // 必要に応じて完了後の処理
            if (data?.data?.usage) {
              console.log('使用トークン:', data.data.usage);
            }
          },
          
          // エラー時のコールバック
          onError: (error) => {
            console.error('ストリーミングエラー:', error);
            setIsLoading(false);
            setError(typeof error === 'string' ? error : 'メッセージの送信中にエラーが発生しました');
            showToast('メッセージの送信中にエラーが発生しました', 'error');
          }
        };
        
        // ストリーミングモードで送信
        const streamingController = UnifiedConversationService.sendStreamingMessage(
          content,
          streamingCallbacks,
          messageType,
          conversationId || undefined,
          currentMessages,
          options
        );
        
        return { streaming: true, controller: streamingController };
      } else {
        // 通常モード（ストリーミングなし）
        const result = await UnifiedConversationService.sendMessage(
          content, 
          messageType, 
          conversationId || undefined, 
          currentMessages,
          options
        );
        
        console.log('会話APIレスポンス:', result);
        
        // APIからの応答を処理
        if (result && result.data) {
          // 会話IDを保存
          if (result.data.contextId || result.data.id) {
            setConversationId(result.data.contextId || result.data.id);
          }
          
          // 応答メッセージを追加
          if (result.data.messages && Array.isArray(result.data.messages)) {
            const apiMessages = result.data.messages;
            console.log('API応答メッセージ:', apiMessages);
            
            if (apiMessages.length > 0) {
              setMessages(apiMessages);
            }
          } else if (result.data.message) {
            // 旧フォーマットの応答を処理（互換性のため）
            const aiMessage = {
              id: `ai-${Date.now()}`,
              sender: 'assistant',
              content: result.data.message,
              timestamp: new Date().toISOString()
            };
            
            setMessages(prevMessages => [
              ...prevMessages.filter(msg => !msg.id.startsWith('temp-')), 
              {
                id: `user-${Date.now()}`,
                sender: 'user',
                content,
                timestamp: new Date().toISOString()
              },
              aiMessage
            ]);
          }
          
          // 会話リストを更新
          await loadAllConversations();
        }
        
        setIsLoading(false);
        return result;
      }
    } catch (error: any) {
      console.error('メッセージ送信エラー:', error);
      setError(error.message || 'メッセージの送信に失敗しました');
      showToast('メッセージの送信に失敗しました', 'error');
      
      // エラー時は一時メッセージを削除
      setMessages(prevMessages => prevMessages.filter(msg => !msg.id.startsWith('temp-')));
      setIsLoading(false);
      
      throw error;
    }
  }, [messages, conversationId, type, loadAllConversations]);
  
  /**
   * 会話をダウンロードする
   */
  const downloadConversation = useCallback(() => {
    try {
      // 会話データをJSONに変換
      const conversationData = {
        id: conversationId,
        type,
        date: new Date().toISOString().split('T')[0],
        messages: messages.map(msg => ({
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
      a.download = `conversation-${type || 'unified'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('会話を保存しました', 'success');
    } catch (error: any) {
      console.error('会話ダウンロードエラー:', error);
      setError(error.message || '会話の保存に失敗しました');
      showToast('会話の保存に失敗しました', 'error');
    }
  }, [conversationId, type, messages]);
  
  /**
   * エラーをクリアする
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    messages,
    isLoading,
    isLoadingHistory,
    conversationId,
    allConversations,
    type,
    error,
    startConversation,
    sendMessage,
    loadConversation,
    deleteConversation,
    downloadConversation,
    clearError
  };
};

export default useUnifiedConversation;