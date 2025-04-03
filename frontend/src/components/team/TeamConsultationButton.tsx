/**
 * チーム目標コンサルティング対話ボタンコンポーネント
 * 
 * チームの目標や動きについてAIに相談するためのボタンとダイアログ
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import { useConversation } from '../../hooks/useConversation';
import ChatInterface from '../conversation/ChatInterface';
import { ConversationType } from '../../utils/sharedTypes';

interface TeamConsultationButtonProps {
  teamId: string;
  teamName: string;
  teamGoal?: string;
}

/**
 * チーム目標コンサルティング対話ボタンコンポーネント
 */
const TeamConsultationButton: React.FC<TeamConsultationButtonProps> = ({ 
  teamId, 
  teamName,
  teamGoal
}) => {
  // 状態管理
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [topic, setTopic] = useState('');
  const [step, setStep] = useState(1); // 1: トピック選択, 2: 対話
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 会話フック
  const { startTeamConsultation } = useConversation();
  
  // ダイアログを開く
  const handleOpenDialog = () => {
    setDialogOpen(true);
    setStep(1);
    setTopic('');
    setError(null);
  };
  
  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setDialogOpen(false);
    // ステップ2の場合は少し間を置いてリセット（アニメーション完了後）
    if (step === 2) {
      setTimeout(() => {
        setStep(1);
        setTopic('');
        setConversationId(undefined);
      }, 300);
    }
  };
  
  // 事前定義された相談トピック
  const predefinedTopics = [
    {
      label: 'チーム目標の達成方法',
      prompt: `${teamName}の目標「${teamGoal || '目標未設定'}」を達成するための具体的なステップやアプローチについて相談したいです。陰陽五行の観点から最適な方法を教えてください。`
    },
    {
      label: 'チームの五行バランス改善',
      prompt: `${teamName}の五行バランスを改善する方法について相談したいです。現在のメンバー構成における強みと弱みを分析し、どのように補完すればよいか助言をください。`
    },
    {
      label: 'メンバー間の相互作用向上',
      prompt: `${teamName}のメンバー間の相互作用を向上させる方法について相談したいです。陰陽五行の相性に基づいて、どのようにすれば最大のシナジーを生み出せるか提案してください。`
    },
    {
      label: 'プロジェクト推進のタイミング',
      prompt: `${teamName}の新しいプロジェクトを始める最適なタイミングについて相談したいです。陰陽五行の周期に基づいた提案をお願いします。`
    },
    {
      label: 'チーム課題の解決アプローチ',
      prompt: `${teamName}が現在直面している課題に対する解決アプローチについて相談したいです。陰陽五行の視点から、どのような方法が効果的か助言をください。`
    },
  ];
  
  // カスタムトピックの場合のプロンプト生成
  const getCustomPrompt = (customTopic: string): string => {
    return `${teamName}について、${customTopic}に関して相談したいです。陰陽五行の観点から分析と助言をお願いします。`;
  };
  
  // トピック選択ハンドラ
  const handleSelectTopic = (topicPrompt: string) => {
    setInitialPrompt(topicPrompt);
    startConsultation(topicPrompt);
  };
  
  // カスタムトピック送信ハンドラ
  const handleSubmitCustomTopic = () => {
    if (!topic.trim()) return;
    const customPrompt = getCustomPrompt(topic);
    setInitialPrompt(customPrompt);
    startConsultation(customPrompt);
  };
  
  // コンサルティング開始処理
  const startConsultation = async (prompt: string) => {
    try {
      setIsStarting(true);
      setError(null);
      
      // チーム目標コンサルティング対話を開始
      const result = await startTeamConsultation(teamId, prompt);
      
      // 会話IDを保存
      if (result?.conversation?.id) {
        setConversationId(result.conversation.id);
      }
      
      // ステップ2（対話画面）に進む
      setStep(2);
    } catch (err: any) {
      console.error('コンサルティング開始エラー:', err);
      setError(err.message || 'コンサルティングの開始に失敗しました。再度お試しください。');
    } finally {
      setIsStarting(false);
    }
  };
  
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ChatIcon />}
        onClick={handleOpenDialog}
        sx={{ 
          borderRadius: 4,
          py: 1,
          boxShadow: 2
        }}
      >
        目標達成相談
      </Button>
      
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth={step === 1 ? "sm" : "md"}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {step === 1 ? (
              <>
                <LightbulbIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">チーム目標コンサルティング</Typography>
              </>
            ) : (
              <>
                <ChatIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">{teamName}の目標相談</Typography>
              </>
            )}
          </Box>
          <IconButton edge="end" onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent sx={{ p: step === 1 ? 3 : 0 }}>
          {step === 1 ? (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <Typography variant="subtitle1" gutterBottom>
                相談内容を選んでください
              </Typography>
              
              {/* 事前定義トピック */}
              <Box sx={{ mb: 4 }}>
                {predefinedTopics.map((predefinedTopic, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    color="primary"
                    endIcon={<NavigateNextIcon />}
                    onClick={() => handleSelectTopic(predefinedTopic.prompt)}
                    disabled={isStarting}
                    sx={{ 
                      mb: 1.5, 
                      width: '100%', 
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      py: 1.5
                    }}
                  >
                    {predefinedTopic.label}
                  </Button>
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  または
                </Typography>
              </Divider>
              
              {/* カスタムトピック入力 */}
              <Typography variant="subtitle1" gutterBottom>
                自由に相談内容を入力
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  placeholder="チームの目標や課題について相談したいこと..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  multiline
                  rows={2}
                  disabled={isStarting}
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitCustomTopic}
                  disabled={isStarting || !topic.trim()}
                  sx={{ py: 1.5 }}
                >
                  {isStarting ? <CircularProgress size={24} /> : '相談する'}
                </Button>
              </Box>
            </>
          ) : (
            // 対話インターフェース
            <Box sx={{ height: 500 }}>
              {conversationId ? (
                <ChatInterface 
                  conversationId={conversationId} 
                  initialPrompt={initialPrompt} 
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        {step === 1 && (
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              キャンセル
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default TeamConsultationButton;