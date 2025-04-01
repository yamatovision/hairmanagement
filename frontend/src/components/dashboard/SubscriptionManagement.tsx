/**
 * サブスクリプション管理コンポーネント
 * 
 * チームのサブスクリプションプラン管理と使用状況の表示
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

// チームサービスとサブスクリプションサービス用インポート
// import subscriptionService from '../../services/subscription.service';
// import teamService from '../../services/team.service';

// プラン型定義
interface ISubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  aiModel: string;
  fortuneModel: string;
  maxMembers: number;
  isPopular?: boolean;
}

// サブスクリプション使用状況型
interface IUsageMetrics {
  apiCalls: number;
  apiCallsLimit: number;
  conversations: number;
  conversationsLimit: number;
  fortunes: number;
  fortunesLimit: number;
  activeMembers: number;
  memberLimit: number;
}

// サブスクリプション情報型
interface ISubscription {
  id: string;
  teamId: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'pending' | 'suspended';
  startDate: string | Date;
  renewalDate: string | Date;
  usageMetrics: IUsageMetrics;
}

// サブスクリプション履歴項目型
interface ISubscriptionHistoryItem {
  id: string;
  date: string | Date;
  action: string;
  details: string;
  user?: string;
}

// プロパティ型定義
interface SubscriptionManagementProps {
  teamId: string;
}

/**
 * サブスクリプション管理コンポーネント
 */
const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ teamId }) => {
  // 状態管理
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<ISubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<string | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = useState<ISubscriptionHistoryItem[]>([]);
  
  // サンプルのサブスクリプションプラン
  const samplePlans: ISubscriptionPlan[] = [
    {
      id: 'standard',
      name: 'スタンダードプラン',
      description: 'チーム管理・運勢予測の基本機能に加え、AI対話機能を含む基本プラン',
      price: 5000,
      features: [
        'デイリーフォーチュンの高品質生成（Claude Sonnet使用）',
        'AI対話機能（Claude Haiku使用）',
        'チーム管理機能',
        '基本的な五行分析',
        '最大10名のチームメンバー'
      ],
      aiModel: 'Claude Haiku',
      fortuneModel: 'Claude Sonnet',
      maxMembers: 10
    },
    {
      id: 'premium',
      name: 'プレミアムプラン',
      description: '高度なAI対話と詳細な分析が可能な上位プラン',
      price: 12000,
      features: [
        'デイリーフォーチュンの高品質生成（Claude Sonnet使用）',
        '高度なAI対話機能（Claude Sonnet使用）',
        'チーム管理機能',
        '詳細な五行分析と相性診断',
        'チーム最適化提案',
        '無制限のAPIコール',
        '最大50名のチームメンバー'
      ],
      aiModel: 'Claude Sonnet',
      fortuneModel: 'Claude Sonnet',
      maxMembers: 50,
      isPopular: true
    }
  ];
  
  // サンプルのサブスクリプション情報
  const sampleSubscription: ISubscription = {
    id: 'sub-1',
    teamId: '1',
    planId: 'standard',
    planName: 'スタンダードプラン',
    status: 'active',
    startDate: '2025-02-01T00:00:00.000Z',
    renewalDate: '2025-05-01T00:00:00.000Z',
    usageMetrics: {
      apiCalls: 1250,
      apiCallsLimit: 2000,
      conversations: 180,
      conversationsLimit: 300,
      fortunes: 45,
      fortunesLimit: 100,
      activeMembers: 7,
      memberLimit: 10
    }
  };
  
  // サンプルの履歴データ
  const sampleHistory: ISubscriptionHistoryItem[] = [
    {
      id: 'history-1',
      date: '2025-02-01T00:00:00.000Z',
      action: 'プラン開始',
      details: 'スタンダードプランのサブスクリプションを開始しました',
      user: '山田 太郎'
    },
    {
      id: 'history-2',
      date: '2025-03-15T00:00:00.000Z',
      action: 'メンバー追加',
      details: '2名のメンバーを追加しました（合計：7名）',
      user: '山田 太郎'
    },
    {
      id: 'history-3',
      date: '2025-03-28T00:00:00.000Z',
      action: 'プラン更新',
      details: 'スタンダードプランを更新しました（次回更新日：2025-05-01）',
      user: 'システム'
    }
  ];
  
  // 初期データ取得
  useEffect(() => {
    // 実際のAPIが実装されるまでモックデータを使用
    const fetchSubscriptionData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 実際のAPIコール（現在は実装されていないためコメントアウト）
        // const subscriptionData = await subscriptionService.getTeamSubscription(teamId);
        // const plansData = await subscriptionService.getAvailablePlans();
        
        // モックデータを使用
        setTimeout(() => {
          setSubscription(sampleSubscription);
          setAvailablePlans(samplePlans);
          setSubscriptionHistory(sampleHistory);
          setIsLoading(false);
        }, 800); // ローディング表示のための遅延
      } catch (err) {
        console.error('サブスクリプションデータ取得エラー:', err);
        setError('サブスクリプション情報の取得に失敗しました。再度お試しください。');
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, [teamId]);
  
  // プラン変更確認ダイアログを開く
  const handleOpenConfirmDialog = (planId: string) => {
    setSelectedNewPlan(planId);
    setConfirmDialogOpen(true);
  };
  
  // プラン変更確認ダイアログを閉じる
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedNewPlan(null);
  };
  
  // プラン変更を実行
  const handleChangePlan = async () => {
    if (!selectedNewPlan) return;
    
    try {
      setIsLoading(true);
      
      // 実際のAPIコール（現在は実装されていないためコメントアウト）
      // await subscriptionService.changePlan(teamId, selectedNewPlan);
      // const updatedSubscription = await subscriptionService.getTeamSubscription(teamId);
      
      // モックの更新処理
      const selectedPlan = availablePlans.find(plan => plan.id === selectedNewPlan);
      if (selectedPlan && subscription) {
        const updatedSubscription = {
          ...subscription,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          // 更新日を3ヶ月後に設定
          renewalDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          usageMetrics: {
            ...subscription.usageMetrics,
            apiCallsLimit: selectedPlan.id === 'premium' ? 5000 : 2000,
            conversationsLimit: selectedPlan.id === 'premium' ? 500 : 300,
            fortunesLimit: selectedPlan.id === 'premium' ? 200 : 100,
            memberLimit: selectedPlan.maxMembers
          }
        };
        
        // 更新履歴に追加
        const newHistoryItem: ISubscriptionHistoryItem = {
          id: `history-${subscriptionHistory.length + 1}`,
          date: new Date().toISOString(),
          action: 'プラン変更',
          details: `${subscription.planName}から${selectedPlan.name}へプランを変更しました`,
          user: '現在のユーザー'
        };
        
        setSubscription(updatedSubscription);
        setSubscriptionHistory([newHistoryItem, ...subscriptionHistory]);
      }
      
      setIsLoading(false);
      handleCloseConfirmDialog();
    } catch (err) {
      console.error('プラン変更エラー:', err);
      setError('プランの変更に失敗しました。再度お試しください。');
      setIsLoading(false);
      handleCloseConfirmDialog();
    }
  };
  
  // 履歴ダイアログを開く
  const handleOpenHistoryDialog = () => {
    setHistoryDialogOpen(true);
  };
  
  // 履歴ダイアログを閉じる
  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
  };
  
  // 使用率を計算する関数
  const calculateUsagePercentage = (current: number, limit: number): number => {
    return Math.min(Math.round((current / limit) * 100), 100);
  };
  
  // 使用率に基づいた色を返す関数
  const getUsageColor = (percentage: number): 'success' | 'info' | 'warning' | 'error' => {
    if (percentage < 50) return 'success';
    if (percentage < 75) return 'info';
    if (percentage < 90) return 'warning';
    return 'error';
  };
  
  // 日付フォーマット関数
  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  // プランの比較テーブル内容
  const renderPlanComparison = () => {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CompareArrowsIcon sx={{ mr: 1 }} />
          プラン比較
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  スタンダードプラン
                </Typography>
                <Typography variant="h5" gutterBottom>
                  ¥5,000<Typography variant="caption" sx={{ ml: 1 }}>/月</Typography>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText primary="デイリーフォーチュン：Claude Sonnet" />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText primary="AI対話：Claude Haiku" />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText primary="基本的な五行分析" />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText primary="月間API制限：2,000回" />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText primary="最大メンバー数：10名" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                {subscription && subscription.planId === 'standard' ? (
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    disabled
                    startIcon={<CheckCircleIcon />}
                  >
                    現在のプラン
                  </Button>
                ) : (
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth
                    onClick={() => handleOpenConfirmDialog('standard')}
                  >
                    このプランにする
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                position: 'relative',
                boxShadow: 2,
                border: '1px solid #3f51b5'
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  backgroundColor: '#3f51b5',
                  color: 'white',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                人気
              </Box>
              
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  プレミアムプラン
                </Typography>
                <Typography variant="h5" gutterBottom>
                  ¥12,000<Typography variant="caption" sx={{ ml: 1 }}>/月</Typography>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List disablePadding>
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText primary="デイリーフォーチュン：Claude Sonnet" />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText 
                      primary="AI対話：Claude Sonnet" 
                      secondary="より詳細な対話と分析"
                      secondaryTypographyProps={{ fontSize: '0.7rem', color: 'primary.main' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText 
                      primary="詳細な五行分析と相性診断" 
                      secondary="チーム最適化提案を含む"
                      secondaryTypographyProps={{ fontSize: '0.7rem', color: 'primary.main' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText 
                      primary="月間API制限：5,000回" 
                      secondary="より多くの対話とフォーチュン"
                      secondaryTypographyProps={{ fontSize: '0.7rem', color: 'primary.main' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText 
                      primary="最大メンバー数：50名"
                      secondary="中規模チームに最適"
                      secondaryTypographyProps={{ fontSize: '0.7rem', color: 'primary.main' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                {subscription && subscription.planId === 'premium' ? (
                  <Button 
                    variant="contained" 
                    color="primary"
                    fullWidth 
                    disabled
                    startIcon={<CheckCircleIcon />}
                  >
                    現在のプラン
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => handleOpenConfirmDialog('premium')}
                    startIcon={<ArrowUpwardIcon />}
                  >
                    アップグレード
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  return (
    <Stack spacing={3}>
      {/* 現在のサブスクリプション情報 */}
      {subscription && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h5" gutterBottom>
              現在のサブスクリプション
            </Typography>
            <Button 
              startIcon={<HistoryIcon />}
              onClick={handleOpenHistoryDialog}
            >
              履歴を表示
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography variant="h6">
                      {subscription.planName}
                    </Typography>
                    <Chip 
                      label="有効" 
                      color="success" 
                      size="small" 
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    開始日: {formatDate(subscription.startDate)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    次回更新日: {formatDate(subscription.renewalDate)}
                  </Typography>
                  
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      AI対話モデル: {subscription.planId === 'premium' ? 'Claude Sonnet' : 'Claude Haiku'}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      フォーチュン生成モデル: Claude Sonnet
                    </Typography>
                  </Box>
                  
                  {subscription.planId === 'standard' && (
                    <Box mt={3}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<UpgradeIcon />}
                        onClick={() => handleOpenConfirmDialog('premium')}
                      >
                        プレミアムにアップグレード
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <BarChartIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      使用状況
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">API使用回数</Typography>
                      <Typography variant="body2">
                        {subscription.usageMetrics.apiCalls} / {subscription.usageMetrics.apiCallsLimit}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateUsagePercentage(
                        subscription.usageMetrics.apiCalls, 
                        subscription.usageMetrics.apiCallsLimit
                      )} 
                      color={getUsageColor(calculateUsagePercentage(
                        subscription.usageMetrics.apiCalls, 
                        subscription.usageMetrics.apiCallsLimit
                      ))}
                      sx={{ mb: 2, height: 8, borderRadius: 4 }}
                    />
                    
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">会話数</Typography>
                      <Typography variant="body2">
                        {subscription.usageMetrics.conversations} / {subscription.usageMetrics.conversationsLimit}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateUsagePercentage(
                        subscription.usageMetrics.conversations, 
                        subscription.usageMetrics.conversationsLimit
                      )}
                      color={getUsageColor(calculateUsagePercentage(
                        subscription.usageMetrics.conversations, 
                        subscription.usageMetrics.conversationsLimit
                      ))}
                      sx={{ mb: 2, height: 8, borderRadius: 4 }}
                    />
                    
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">フォーチュン生成数</Typography>
                      <Typography variant="body2">
                        {subscription.usageMetrics.fortunes} / {subscription.usageMetrics.fortunesLimit}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateUsagePercentage(
                        subscription.usageMetrics.fortunes, 
                        subscription.usageMetrics.fortunesLimit
                      )}
                      color={getUsageColor(calculateUsagePercentage(
                        subscription.usageMetrics.fortunes, 
                        subscription.usageMetrics.fortunesLimit
                      ))}
                      sx={{ mb: 2, height: 8, borderRadius: 4 }}
                    />
                    
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">アクティブメンバー</Typography>
                      <Typography variant="body2">
                        {subscription.usageMetrics.activeMembers} / {subscription.usageMetrics.memberLimit}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateUsagePercentage(
                        subscription.usageMetrics.activeMembers, 
                        subscription.usageMetrics.memberLimit
                      )}
                      color={getUsageColor(calculateUsagePercentage(
                        subscription.usageMetrics.activeMembers, 
                        subscription.usageMetrics.memberLimit
                      ))}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* 利用可能なプラン比較 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {renderPlanComparison()}
      </Paper>
      
      {/* プラン変更確認ダイアログ */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="plan-change-dialog-title"
      >
        <DialogTitle id="plan-change-dialog-title">
          プラン変更の確認
        </DialogTitle>
        <DialogContent>
          {selectedNewPlan && (
            <>
              <Typography variant="body1" paragraph>
                {subscription?.planName}から
                {selectedNewPlan === 'premium' ? 'プレミアムプラン' : 'スタンダードプラン'}
                に変更しますか？
              </Typography>
              
              {selectedNewPlan === 'premium' ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  プレミアムプランでは、AI対話にClaude Sonnetを使用し、より詳細な分析と対話が可能になります。
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  スタンダードプランでは、AI対話にClaude Haikuを使用し、機能が制限されます。
                </Alert>
              )}
              
              <Typography variant="body1" paragraph>
                変更は即時反映され、請求は比例配分で調整されます。
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="inherit">
            キャンセル
          </Button>
          <Button 
            onClick={handleChangePlan} 
            color="primary" 
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : '変更を確定'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* サブスクリプション履歴ダイアログ */}
      <Dialog
        open={historyDialogOpen}
        onClose={handleCloseHistoryDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          サブスクリプション履歴
        </DialogTitle>
        <DialogContent>
          <List>
            {subscriptionHistory.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle1">{item.action}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(item.date)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {item.details}
                        </Typography>
                        {item.user && (
                          <Typography variant="body2" color="textSecondary" component="div" sx={{ mt: 0.5 }}>
                            実行者: {item.user}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog} color="primary">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default SubscriptionManagement;