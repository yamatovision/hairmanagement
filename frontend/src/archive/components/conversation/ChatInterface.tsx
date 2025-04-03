import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, CircularProgress, Paper, Typography, Avatar, Divider, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DownloadIcon from '@mui/icons-material/Download';
import { useConversation } from '../../hooks/useConversation';

interface ChatInterfaceProps {
  type: 'fortune' | 'team' | 'member';
  contextId: string;
  initialPrompt?: string;
}

/**
 * シンプル化されたチャットインターフェース
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  type, 
  contextId,
  initialPrompt
}) => {
  const { 
    messages, 
    isLoading, 
    startConversation, 
    sendMessage,
    downloadConversation
  } = useConversation();
  
  const [inputMessage, setInputMessage] = useState(initialPrompt || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // コンポーネントマウント時に会話を開始
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        await startConversation(type, contextId);
      } catch (error) {
        console.error('会話初期化エラー:', error);
      }
    };
    
    initializeConversation();
  }, [type, contextId, startConversation]);
  
  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // メッセージ送信ハンドラー
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;
    
    sendMessage(inputMessage);
    setInputMessage('');
  };
  
  // 日付をフォーマットする関数
  const formatTimestamp = (timestamp: string | Date): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            五行
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {type === 'fortune' ? '運勢相談' : 
               type === 'team' ? 'チーム相談' : 'メンバー相談'}
            </Typography>
            <Typography variant="caption">陰陽五行AIケアコンパニオン</Typography>
          </Box>
        </Box>
        
        {/* ダウンロードボタン */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={downloadConversation}
          sx={{ 
            color: 'white', 
            borderColor: 'rgba(255,255,255,0.5)',
            '&:hover': {
              borderColor: 'white',
              bgcolor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          保存
        </Button>
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
              会話を始めましょう
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
              {type === 'fortune' ? '今日の運勢に合わせたアドバイスが受けられます' :
               type === 'team' ? 'チームに関する相談ができます' :
               'メンバーとの相性について相談できます'}
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((message, index) => {
              const isUser = message.sender === 'user';
              
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
                    
                    {/* タイムスタンプ */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, opacity: 0.7 }}>
                      <Typography variant="caption">
                        {formatTimestamp(message.timestamp)}
                      </Typography>
                    </Box>
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