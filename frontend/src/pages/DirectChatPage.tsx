import React, { useState, useEffect } from 'react';
import { Container, Paper, useTheme, Box, Typography, Snackbar, Alert, Switch, FormControlLabel } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import DirectChatInterface from '../components/conversation/DirectChatInterface';
import UnifiedChatInterface from '../components/conversation/UnifiedChatInterface';

/**
 * 直接会話ページコンポーネント - 統合会話APIを使用（レガシーAPIへのフォールバック機能あり）
 */
interface DirectChatPageProps {
  initialType?: 'fortune' | 'team' | 'member';
}

const DirectChatPage: React.FC<DirectChatPageProps> = ({ initialType }) => {
  const theme = useTheme();
  const { type } = useParams<{ type?: string }>();
  const location = useLocation();
  
  // URLクエリからパラメータを取得
  const queryParams = new URLSearchParams(location.search);
  const contextId = queryParams.get('contextId');
  const initialPrompt = queryParams.get('prompt');
  
  // 統合APIを使用するかどうかの状態
  // デフォルトで統合APIを使用（環境変数などで管理することも可能）
  const [useUnifiedApi, setUseUnifiedApi] = useState<boolean>(true);
  const [showApiToggle, setShowApiToggle] = useState<boolean>(false);

  // 開発モードの場合にのみAPIトグルを表示
  useEffect(() => {
    // 本番環境では開発者トグルを表示しない
    if (process.env.NODE_ENV === 'development') {
      setShowApiToggle(true);
    }
  }, []);
  
  // URLパラメータのバリデーション（優先順位: props > URL path > URL query > default）
  const conversationType = (initialType || type || queryParams.get('type') || 'general') as 'fortune' | 'team' | 'member';
  const validContextId = contextId || 'default';
  
  // 会話オプション
  const conversationOptions = {
    includeUserContext: true,
    includeSajuProfile: conversationType === 'fortune' || conversationType === 'team',
    includeElementalProfile: conversationType === 'fortune' || conversationType === 'team'
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 開発モード時のAPIトグル */}
      {showApiToggle && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            control={
              <Switch
                checked={useUnifiedApi}
                onChange={(e) => setUseUnifiedApi(e.target.checked)}
                color="secondary"
                size="small"
              />
            }
            label={
              <Typography variant="caption" color="textSecondary">
                {useUnifiedApi ? '統合API' : 'レガシーAPI'}
              </Typography>
            }
          />
        </Box>
      )}
      
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
        {useUnifiedApi ? (
          <UnifiedChatInterface
            type={conversationType}
            contextId={validContextId}
            initialPrompt={initialPrompt || undefined}
            options={conversationOptions}
          />
        ) : (
          <DirectChatInterface
            type={conversationType}
            contextId={validContextId}
            initialPrompt={initialPrompt || undefined}
          />
        )}
      </Paper>
    </Container>
  );
};

export default DirectChatPage;