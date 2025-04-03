/**
 * デイリーフォーチュンページ
 * モックアップに基づく新実装（ジョナサン・アイブデザイン）
 */

import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Button, 
  CircularProgress, 
  IconButton,
  useTheme, 
  AppBar,
  Toolbar
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  AutoGraph as AutoGraphIcon,
  Chat as ChatIcon,
  Route as RouteIcon,
  Person as PersonIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon
} from '@mui/icons-material';

// Material Iconsをコンポーネント外で使用するための設定
import Icon from '@mui/material/Icon';

import { FortuneProvider, useFortune } from '../contexts/FortuneContext';
import DailyFortune from '../components/fortune/DailyFortune';
import FortuneCalendar from '../components/fortune/FortuneCalendar';
import FortuneDetail from '../components/fortune/FortuneDetail';

// 五行属性の色マッピング
const elementColors = {
  '木': '#43a047',
  '火': '#e53935',
  '土': '#ff8f00',
  '金': '#fdd835',
  '水': '#1e88e5'
};

/**
 * フォーチュンページの内部コンテンツ
 */
const FortunePageContent = () => {
  const theme = useTheme();
  const { dailyFortune, selectFortune, fetchDailyFortune, loading, error } = useFortune();
  const [refreshing, setRefreshing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // ページ読み込み時に一度だけデータ取得
  useEffect(() => {
    fetchDailyFortune();
  }, [fetchDailyFortune]);

  // データの手動更新
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDailyFortune();
    } catch (err) {
      console.error('運勢データの更新エラー:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // データロード時に自動選択
  useEffect(() => {
    if (dailyFortune) {
      selectFortune(dailyFortune);
    }
  }, [dailyFortune, selectFortune]);

  // 詳細表示の切り替え機能は不要に
  const handleBackToSummary = () => {
    setShowDetail(false);
  };

  // 読み込み中表示
  if (loading && !dailyFortune && !refreshing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // エラー表示
  if (error && !dailyFortune && !refreshing) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              再試行
            </Button>
          }
        >
          運勢データの取得に失敗しました
        </Alert>
      </Box>
    );
  }

  // 五行属性に基づく背景色の設定
  const elementType = dailyFortune?.sajuData?.mainElement || '火';
  const headerBgColor = elementColors[elementType as keyof typeof elementColors] || '#e53935';

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f3e5f5 0%, #f5f5f5 100%)',
        backgroundAttachment: 'fixed',
        pb: 10 // 下部ナビゲーション用のパディング
      }}
    >
      {/* ヘッダー */}
      <AppBar 
        position="sticky" 
        elevation={4}
        sx={{ 
          background: 'linear-gradient(135deg, #6a1b9a 0%, #9c27b0 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar>
          {showDetail && (
            <IconButton 
              color="inherit" 
              edge="start" 
              onClick={handleBackToSummary}
              sx={{ mr: 1 }}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <AutoGraphIcon sx={{ mr: 1.2 }} />
            デイリーフォーチュン
          </Typography>
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ */}
      <Container 
        maxWidth="md" 
        sx={{ 
          mt: 4, 
          mb: 4,
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(15px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          },
          animation: 'fadeIn 0.8s ease-out'
        }}
      >
        {showDetail ? (
          <FortuneDetail fortune={dailyFortune} />
        ) : (
          <>
            {/* デイリー運勢カード */}
            <DailyFortune onClickViewDetail={() => {}} />
            
            {/* チームヒント */}
            <Box
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                p: 3.5,
                mb: 4,
                boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                borderLeft: `4px solid ${headerBgColor}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.16)'
                },
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(15px)' },
                  to: { opacity: 1, transform: 'translateY(0)' }
                },
                animation: 'fadeIn 0.8s ease-out',
                animationDelay: '0.3s',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              {/* 背景効果 */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 150,
                  background: `linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.03))`,
                  zIndex: 0
                }}
              />

              <Typography 
                variant="h6" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontWeight: 600, 
                  mb: 2,
                  zIndex: 1,
                  position: 'relative'
                }}
              >
                <Icon sx={{ mr: 1.5, color: headerBgColor }}>diversity_3</Icon>
                チームヒント
              </Typography>

              <Typography sx={{ mb: 2 }}>
                今日はチーム内の「{elementType}」属性の同僚との相性が特に良好です。同じ{elementType}タイプ同士で新しいアイデアを共有すると、さらに発展するでしょう。
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Icon>local_fire_department</Icon>}
                  sx={{
                    borderRadius: 6,
                    bgcolor: `${headerBgColor}15`,
                    color: headerBgColor,
                    borderColor: `${headerBgColor}40`,
                    '&:hover': {
                      bgcolor: `${headerBgColor}25`,
                      borderColor: headerBgColor
                    }
                  }}
                >
                  田中さん
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Icon>local_fire_department</Icon>}
                  sx={{
                    borderRadius: 6,
                    bgcolor: `${headerBgColor}15`,
                    color: headerBgColor,
                    borderColor: `${headerBgColor}40`,
                    '&:hover': {
                      bgcolor: `${headerBgColor}25`,
                      borderColor: headerBgColor
                    }
                  }}
                >
                  山田さん
                </Button>
              </Box>
            </Box>
            
            {/* カレンダー */}
            <FortuneCalendar onSelectDate={(fortune) => { selectFortune(fortune); setShowDetail(true); }} />
          </>
        )}
        
        {/* ローディングインジケーター */}
        {refreshing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Container>

      {/* ボトムナビゲーション */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          bgcolor: 'rgba(255, 255, 255, 0.95)', 
          display: 'flex', 
          justifyContent: 'space-around',
          boxShadow: '0 -2px 15px rgba(0,0,0,0.12)',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          padding: '4px 0'
        }}
      >
        {/* 運勢（アクティブ） */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '12px 0',
            minWidth: '72px',
            flex: 1,
            color: theme.palette.primary.main,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40%',
              height: '3px',
              bgcolor: theme.palette.primary.main,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <AutoGraphIcon sx={{ fontSize: '1.6rem', mb: 0.5 }} />
          <Typography variant="caption" fontWeight={500}>運勢</Typography>
        </Box>
        
        {/* 対話 */}
        <Box 
          component="a"
          href="#"
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '12px 0',
            minWidth: '72px',
            flex: 1,
            color: theme.palette.text.secondary,
            textDecoration: 'none'
          }}
        >
          <ChatIcon sx={{ fontSize: '1.6rem', mb: 0.5 }} />
          <Typography variant="caption" fontWeight={500}>対話</Typography>
        </Box>
        
        {/* キャリア */}
        <Box 
          component="a"
          href="#"
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '12px 0',
            minWidth: '72px',
            flex: 1,
            color: theme.palette.text.secondary,
            textDecoration: 'none'
          }}
        >
          <RouteIcon sx={{ fontSize: '1.6rem', mb: 0.5 }} />
          <Typography variant="caption" fontWeight={500}>キャリア</Typography>
        </Box>
        
        {/* チーム */}
        <Box 
          component="a"
          href="#"
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '12px 0',
            minWidth: '72px',
            flex: 1,
            color: theme.palette.text.secondary,
            textDecoration: 'none'
          }}
        >
          <Icon sx={{ fontSize: '1.6rem', mb: 0.5 }}>diversity_3</Icon>
          <Typography variant="caption" fontWeight={500}>チーム</Typography>
        </Box>
        
        {/* プロフィール */}
        <Box 
          component="a"
          href="#"
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '12px 0',
            minWidth: '72px',
            flex: 1,
            color: theme.palette.text.secondary,
            textDecoration: 'none',
            position: 'relative'
          }}
        >
          <PersonIcon sx={{ fontSize: '1.6rem', mb: 0.5 }} />
          <Typography variant="caption" fontWeight={500}>プロフィール</Typography>
          <Box 
            sx={{ 
              position: 'absolute', 
              top: '8px', 
              right: '12px', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              bgcolor: headerBgColor
            }} 
          />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * デイリーフォーチュンページのコンテナコンポーネント
 */
const DailyFortunePage = () => (
  <FortuneProvider>
    <FortunePageContent />
  </FortuneProvider>
);

export default DailyFortunePage;