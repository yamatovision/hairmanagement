import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, CircularProgress, Paper, Typography, Avatar, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ElementTag from '../common/ElementTag';
import { IMessage } from '../../utils/sharedTypes';
import { useConversation } from '../../hooks/useConversation';

// 五行要素をメッセージから抽出/推定する関数
const extractElementType = (message: IMessage): ('木' | '火' | '土' | '金' | '水')[] => {
  const content = message.content.toLowerCase();
  
  // メッセージ内容からのキーワードベースの推測（実際のアプリではAIによる分類が望ましい）
  const elements = [];
  
  if (content.includes('成長') || content.includes('発展') || content.includes('変化') || content.includes('創造')) {
    elements.push('木');
  }
  
  if (content.includes('情熱') || content.includes('感情') || content.includes('表現') || content.includes('エネルギー')) {
    elements.push('火');
  }
  
  if (content.includes('安定') || content.includes('調和') || content.includes('バランス') || content.includes('信頼')) {
    elements.push('土');
  }
  
  if (content.includes('精度') || content.includes('完璧') || content.includes('正確') || content.includes('品質')) {
    elements.push('金');
  }
  
  if (content.includes('知恵') || content.includes('直感') || content.includes('流れ') || content.includes('柔軟')) {
    elements.push('水');
  }
  
  // デフォルト要素（空の場合）
  if (elements.length === 0) {
    // AIのメッセージには木属性を、ユーザーのメッセージには火属性をデフォルトに
    elements.push(message.sender === 'ai' ? '木' : '火');
  }
  
  return elements as ('木' | '火' | '土' | '金' | '水')[];
};

// 日付をフォーマットする関数
const formatTimestamp = (timestamp: string | Date): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface ChatInterfaceProps {
  conversationId?: string;
  fortuneId?: string;
  initialPrompt?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  conversationId, 
  fortuneId,
  initialPrompt 
}) => {
  // conversationIdのバリデーション - 有効なIDのみを通過させる
  const validConversationId = conversationId && 
    conversationId !== 'fortune' && 
    !conversationId.includes('?') ? 
    conversationId : undefined;
    
  // 検証のためのデバッグログ
  console.log('ChatInterface Props:', { 
    original: conversationId,
    validated: validConversationId, 
    fortuneId,
    hasInitialPrompt: !!initialPrompt
  });
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    favoriteMessage, 
    currentConversation,
    startFortuneConsultation
  } = useConversation(validConversationId);
  
  // fortuneIdが指定されていて会話IDがない場合、フォーチュン相談を自動開始
  useEffect(() => {
    // このコンポーネントがマウントされたかどうかのフラグ
    let isMounted = true;
    // 初回レンダリング時のみ実行するためのフラグ
    const shouldInitialize = fortuneId && !conversationId && !currentConversation;
    
    // フォーチュン相談開始処理
    const initializeFortuneConsultation = async () => {
      if (!shouldInitialize) return;
      
      console.log('フォーチュン相談を自動開始:', fortuneId);
      try {
        await startFortuneConsultation(fortuneId);
      } catch (error) {
        if (!isMounted) return; // コンポーネントがアンマウントされていたら処理しない
        
        console.error('フォーチュン相談自動開始エラー:', error);
        // エラーメッセージをカスタマイズ（タイムアウトエラーの場合など）
        let errorMessage = 'フォーチュン相談の開始に失敗しました。しばらくしてからもう一度お試しください。';
        
        if (error instanceof Error) {
          if (error.message.includes('タイムアウト')) {
            errorMessage = 'サーバーの応答がタイムアウトしました。しばらくしてからもう一度お試しください。';
          } else if (error.message.includes('フォーチュンID')) {
            errorMessage = 'フォーチュンIDが正しく指定されていません。';
          } else if (error.message) {
            errorMessage = error.message;
          }
        }
        
        alert(errorMessage);
      }
    };
    
    // 初期化処理を開始
    initializeFortuneConsultation();
    
    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, [fortuneId, conversationId, currentConversation, startFortuneConsultation]);
  
  const [inputMessage, setInputMessage] = useState(initialPrompt || '');
  const [dailyElement, setDailyElement] = useState<'木' | '火' | '土' | '金' | '水'>('木');
  const [yinYang, setYinYang] = useState<'陰' | '陽'>('陽');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 日付（今日の属性要素）を設定
  useEffect(() => {
    // 実際のアプリでは運勢APIからデータを取得
    const elements = ['木', '火', '土', '金', '水'];
    const randomElement = elements[Math.floor(Math.random() * elements.length)] as '木' | '火' | '土' | '金' | '水';
    setDailyElement(randomElement);
    
    const yinYangValues = ['陰', '陽'];
    const randomYinYang = yinYangValues[Math.floor(Math.random() * yinYangValues.length)] as '陰' | '陽';
    setYinYang(randomYinYang);
  }, []);
  
  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // メッセージ送信ハンドラー
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;
    
    sendMessage(inputMessage, { fortuneId });
    setInputMessage('');
  };
  
  // メッセージのお気に入り登録/解除
  const handleToggleFavorite = (messageId: string) => {
    favoriteMessage(messageId);
  };
  
  // クイックリプライ選択ハンドラー
  const handleQuickReply = (reply: string) => {
    sendMessage(reply, { fortuneId });
  };
  
  // AIメッセージにサジェスチョンを追加（実際のアプリではAIからの提案を使用）
  const getQuickReplySuggestions = (message: IMessage): string[] => {
    if (message.sender !== 'ai') return [];
    
    // 最後のAIメッセージだけに表示
    const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai');
    if (lastAiMessage?.id !== message.id) return [];
    
    // メッセージ内容に基づく簡易的なサジェスチョン
    if (message.content.includes('技術')) {
      return [
        'カラーリングの新しい技術を学びたいです',
        'カット技術をもっと向上させたいです',
        'トレンドのヘアアレンジを習得したいです'
      ];
    } else if (message.content.includes('チーム') || message.content.includes('同僚')) {
      return [
        'チームでスタイルブックを作りたいです',
        'メンバーとの技術交換会を開きたいです',
        'もっとチーム内でコミュニケーションを取りたいです'
      ];
    }
    
    // デフォルトのサジェスチョン
    return [
      'もう少し詳しく教えてください',
      'それは良いアイデアですね',
      '他にどんなアドバイスがありますか？'
    ];
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: '100%',
        bgcolor: '#f5f5f5',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* ヘッダー */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt="五行アシスタント"
            src="/img/logo192.png"
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: 'white',
              color: 'primary.main',
              mr: 2
            }}
          >
            {/* 五行の漢字を表示（アバター画像がない場合） */}
            五行
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              五行アシスタント
            </Typography>
            <Typography variant="caption">陰陽五行AIケアコンパニオン</Typography>
          </Box>
        </Box>
        
        {/* 今日の調和表示 */}
        <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
          <Typography variant="caption" sx={{ mr: 1 }}>今日の調和</Typography>
          <Box 
            sx={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%',
              background: 'linear-gradient(to right, #2c3e50 0%, #2c3e50 50%, #f1c40f 50%, #f1c40f 100%)',
              position: 'relative',
              mr: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 8,
                height: 8,
                borderRadius: '50%',
                top: 2,
                left: 6,
                bgcolor: '#f1c40f'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: 8,
                height: 8,
                borderRadius: '50%',
                bottom: 2,
                right: 6,
                bgcolor: '#2c3e50'
              }
            }}
          />
          <ElementTag element={dailyElement} size="sm" />
          <Typography variant="caption" sx={{ ml: 1 }}>{yinYang}の日</Typography>
        </Box>
      </Box>
      
      {/* メッセージ表示エリア */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: '#f5f5f5',
          backgroundImage: 'radial-gradient(rgba(156, 39, 176, 0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {messages.length === 0 && !isLoading ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 0.7
            }}
          >
            <Typography variant="body1" color="textSecondary" align="center">
              五行アシスタントとの会話を始めましょう
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
              今日の運勢に合わせたアドバイスが受けられます
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message, index) => {
              const isUser = message.sender === 'user';
              const elements = extractElementType(message);
              const isFavorite = (message as any).isFavorite;
              
              return (
                <Box
                  key={message.id || index}
                  sx={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      maxWidth: '80%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isUser ? 'primary.main' : 'white',
                      color: isUser ? 'white' : 'text.primary',
                      position: 'relative',
                      ...(isUser
                        ? { borderBottomRightRadius: 0 }
                        : { borderBottomLeftRadius: 0 }),
                      animation: 'fadeIn 0.3s ease'
                    }}
                  >
                    {/* 五行要素タグ（AIメッセージのみ） */}
                    {!isUser && (
                      <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap' }}>
                        {elements.map((element, i) => (
                          <ElementTag
                            key={i}
                            element={element}
                            size="sm"
                          />
                        ))}
                      </Box>
                    )}
                    
                    {/* メッセージ内容 */}
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {message.content}
                    </Typography>
                    
                    {/* タイムスタンプとお気に入りアイコン */}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1,
                        opacity: 0.7
                      }}
                    >
                      <Typography variant="caption">
                        {formatTimestamp(message.timestamp)}
                      </Typography>
                      
                      {/* AIメッセージのみお気に入り可能 */}
                      {!isUser && (
                        <IconButton
                          size="small"
                          onClick={() => handleToggleFavorite(message.id)}
                          sx={{ 
                            color: 'inherit',
                            opacity: 0.7,
                            '&:hover': { opacity: 1 }
                          }}
                        >
                          {isFavorite ? (
                            <BookmarkIcon fontSize="small" />
                          ) : (
                            <BookmarkBorderIcon fontSize="small" />
                          )}
                        </IconButton>
                      )}
                    </Box>
                    
                    {/* クイックリプライオプション（最新のAIメッセージのみ） */}
                    {!isUser && (
                      <Box sx={{ mt: 2 }}>
                        {getQuickReplySuggestions(message).map((reply, i) => (
                          <Box
                            key={i}
                            onClick={() => handleQuickReply(reply)}
                            sx={{
                              display: 'inline-block',
                              bgcolor: 'rgba(0, 0, 0, 0.05)',
                              p: '6px 12px',
                              borderRadius: 4,
                              m: '4px 8px 4px 0',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.1)',
                              }
                            }}
                          >
                            {reply}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Box>
              );
            })}
            
            {/* 読み込み中表示 */}
            {isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  mb: 2
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderBottomLeftRadius: 0,
                    bgcolor: 'white'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} thickness={5} sx={{ mr: 2 }} />
                    <Typography variant="body2">応答を作成中...</Typography>
                  </Box>
                </Paper>
              </Box>
            )}
            
            {/* 自動スクロールのためのダミー要素 */}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>
      
      {/* ヒント表示（適宜表示） */}
      {messages.length > 0 && messages.length % 5 === 0 && (
        <Box
          sx={{
            mx: 2,
            my: 1,
            p: 1.5,
            bgcolor: '#fff8e1',
            borderRadius: 1,
            borderLeft: '3px solid #f1c40f',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span style={{ marginRight: 8, fontSize: '1rem' }}>💡</span>
          過去の会話はプロフィールページで確認できます
        </Box>
      )}
      
      {/* メッセージ入力エリア */}
      <Divider />
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <TextField
          fullWidth
          placeholder="メッセージを入力..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 4
            }
          }}
          disabled={isLoading}
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={isLoading || inputMessage.trim() === ''}
          sx={{ ml: 1 }}
        >
          <SendIcon />
        </IconButton>
      </Box>
      
      {/* スタイル定義 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default ChatInterface;