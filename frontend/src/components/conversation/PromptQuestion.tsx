import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, CircularProgress, IconButton } from '@mui/material';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import RefreshIcon from '@mui/icons-material/Refresh';
import ElementTag from '../common/ElementTag';
// モック実装
const mockGeneratePrompt = async (params: any) => {
  return {
    content: "今日はどのような課題に取り組んでいますか？",
    category: params.category || "growth"
  };
};
// アーカイブされたフックを削除（以前のシステムで使用）
// import { useConversation } from '../../hooks/useConversation';
import { useAuth } from '../../contexts/AuthContext';

type PromptCategory = 'growth' | 'team' | 'career' | 'organization';

interface PromptQuestionProps {
  fortuneId?: string;
  category?: PromptCategory;
  onAnswerClick: (question: string) => void;
}

const PromptQuestion: React.FC<PromptQuestionProps> = ({
  fortuneId,
  category,
  onAnswerClick
}) => {
  // useConversationからgeneratePromptQuestionを取得する代わりにモック実装を使用
  const generatePromptQuestion = mockGeneratePrompt;
  const { user } = useAuth();
  
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [promptCategory, setPromptCategory] = useState<PromptCategory | null>(category || null);
  
  // カテゴリに基づくスタイルを設定
  const getCategoryStyle = (category: PromptCategory | null) => {
    switch (category) {
      case 'growth':
        return {
          element: '木' as const,
          icon: '🌱',
          label: '成長',
          bgColor: 'rgba(165, 214, 167, 0.15)'
        };
      case 'team':
        return {
          element: '金' as const,
          icon: '🤝',
          label: 'チーム',
          bgColor: 'rgba(224, 224, 224, 0.15)'
        };
      case 'career':
        return {
          element: '火' as const,
          icon: '🔥',
          label: 'キャリア',
          bgColor: 'rgba(255, 171, 145, 0.15)'
        };
      case 'organization':
        return {
          element: '土' as const,
          icon: '🏢',
          label: '組織',
          bgColor: 'rgba(215, 204, 200, 0.15)'
        };
      default:
        return {
          element: '水' as const,
          icon: '💧',
          label: '五行',
          bgColor: 'rgba(129, 212, 250, 0.15)'
        };
    }
  };
  
  const categoryStyle = getCategoryStyle(promptCategory);
  
  // 質問を生成する関数
  const fetchPromptQuestion = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generatePromptQuestion({
        userId: user.id,
        fortuneId,
        category: promptCategory || undefined
      });
      
      setPrompt(result.content);
      // バックエンドからカテゴリが返された場合は更新
      if (result.category) {
        setPromptCategory(result.category as PromptCategory);
      }
    } catch (err) {
      console.error('質問生成エラー:', err);
      setError('質問を読み込めませんでした。再試行してください。');
      setPrompt('');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 初回マウント時と依存変数変更時に質問を取得
  useEffect(() => {
    if (user) {
      fetchPromptQuestion();
    }
  }, [fortuneId, category, user]);
  
  // 新しい質問を生成
  const handleRefresh = () => {
    fetchPromptQuestion();
  };
  
  // 質問に回答
  const handleAnswer = () => {
    onAnswerClick(prompt);
  };
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: categoryStyle.bgColor,
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          height: '100%', 
          width: '4px',
          bgcolor: theme => 
            category === 'growth' ? theme.palette.success.main :
            category === 'team' ? theme.palette.info.main :
            category === 'career' ? theme.palette.warning.main :
            category === 'organization' ? theme.palette.secondary.main :
            theme.palette.primary.main
        }} 
      />
      
      {/* ヘッダー */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ElementTag 
            element={categoryStyle.element}
            label={categoryStyle.label}
          />
          <Typography 
            variant="subtitle1" 
            component="h3" 
            sx={{ 
              ml: 1,
              fontWeight: 500
            }}
          >
            今日の呼び水質問
          </Typography>
        </Box>
        
        <IconButton 
          size="small" 
          onClick={handleRefresh}
          disabled={isLoading}
          sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>
      
      {/* 質問内容 */}
      <Box sx={{ minHeight: 80, display: 'flex', alignItems: 'center' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500,
              lineHeight: 1.5,
              fontSize: '1.05rem'
            }}
          >
            {prompt}
          </Typography>
        )}
      </Box>
      
      {/* アクションボタン */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          endIcon={<NorthEastIcon />}
          onClick={handleAnswer}
          disabled={isLoading || !prompt}
          sx={{
            borderRadius: 8,
            px: 3,
            color: 'primary.main',
            borderColor: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              bgcolor: 'rgba(156, 39, 176, 0.04)'
            }
          }}
        >
          回答する
        </Button>
      </Box>
    </Paper>
  );
};

export default PromptQuestion;