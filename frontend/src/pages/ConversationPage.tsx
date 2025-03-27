import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Tab, Tabs, useMediaQuery, useTheme, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ChatInterface from '../components/conversation/ChatInterface';
import PromptQuestion from '../components/conversation/PromptQuestion';
import ConversationHistory from '../components/conversation/ConversationHistory';
import { useConversation } from '../hooks/useConversation';
import { useFortune } from '../hooks/useFortune';

/**
 * ConversationPage コンポーネント
 * 会話インターフェースとその関連機能を提供するページ
 */
const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { dailyFortune } = useFortune();
  const { getConversationById } = useConversation();
  
  const [tabValue, setTabValue] = useState<number>(0);
  const [promptQuestion, setPromptQuestion] = useState<string | null>(null);
  
  // 会話詳細を取得（既存の会話の場合）
  useEffect(() => {
    if (conversationId) {
      getConversationById(conversationId);
    }
  }, [conversationId]);
  
  // タブ切り替え処理
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // 新しい会話を開始
  const handleNewConversation = () => {
    navigate('/conversation');
  };
  
  // 呼び水質問への回答
  const handleAnswerPrompt = (question: string) => {
    setPromptQuestion(question);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* モバイル表示でのタブ切り替え */}
        {isMobile && (
          <Grid item xs={12}>
            <Paper sx={{ mb: 2 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                aria-label="会話タブ"
              >
                <Tab label="チャット" />
                <Tab label="履歴" />
              </Tabs>
            </Paper>
          </Grid>
        )}
        
        {/* チャットインターフェース */}
        {(!isMobile || tabValue === 0) && (
          <Grid item xs={12} md={8} lg={8}>
            {/* 呼び水質問カード */}
            {!conversationId && (
              <Box sx={{ mb: 3 }}>
                <PromptQuestion
                  fortuneId={dailyFortune?.id}
                  onAnswerClick={handleAnswerPrompt}
                />
              </Box>
            )}
            
            {/* チャットインターフェース */}
            <Paper
              elevation={2}
              sx={{
                height: conversationId ? 'calc(100vh - 150px)' : 'calc(100vh - 300px)',
                minHeight: '500px',
                overflow: 'hidden',
                borderRadius: 2
              }}
            >
              <ChatInterface
                conversationId={conversationId}
                fortuneId={dailyFortune?.id}
                initialPrompt={promptQuestion || undefined}
              />
            </Paper>
          </Grid>
        )}
        
        {/* 会話履歴サイドバー */}
        {(!isMobile || tabValue === 1) && (
          <Grid item xs={12} md={4} lg={4}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 2,
                height: isMobile ? 'auto' : 'calc(100vh - 150px)',
                overflow: 'auto'
              }}
            >
              {/* 新規会話ボタン */}
              {conversationId && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleNewConversation}
                    sx={{ borderRadius: 8 }}
                  >
                    新しい会話を始める
                  </Button>
                </Box>
              )}
              
              {/* 会話履歴リスト */}
              <ConversationHistory
                maxItems={isMobile ? 5 : 10}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ConversationPage;