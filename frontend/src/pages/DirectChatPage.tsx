import React from 'react';
import { Container, Paper, useTheme } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import DirectChatInterface from '../components/conversation/DirectChatInterface';

/**
 * 直接会話ページコンポーネント - direct-conversations APIを使用
 */
const DirectChatPage: React.FC = () => {
  const theme = useTheme();
  const { type } = useParams<{ type?: string }>();
  const location = useLocation();
  
  // URLクエリからパラメータを取得
  const queryParams = new URLSearchParams(location.search);
  const contextId = queryParams.get('contextId');
  const initialPrompt = queryParams.get('prompt');
  
  // URLパラメータのバリデーション
  const conversationType = (type || queryParams.get('type') || 'general') as 'fortune' | 'team' | 'member';
  const validContextId = contextId || 'default';
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={2}
        sx={{
          height: 'calc(100vh - 150px)',
          minHeight: '500px',
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: 'transparent',
          boxShadow: 'none'
        }}
      >
        <DirectChatInterface
          type={conversationType}
          contextId={validContextId}
          initialPrompt={initialPrompt || undefined}
        />
      </Paper>
    </Container>
  );
};

export default DirectChatPage;