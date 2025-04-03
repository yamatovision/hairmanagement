/**
 * デイリーフォーチュンページ - モックアップベース実装
 * 
 * 注意: このファイルはアーカイブです。現在は使用されていません。
 */

import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Button, 
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  AutoGraph as AutoGraphIcon
} from '@mui/icons-material';

import { FortuneProvider, useFortune } from '../contexts/FortuneContext';
import DailyFortune from '../components/fortune/DailyFortune';
import FortuneCalendar from '../components/fortune/FortuneCalendar';
import FortuneDetail from '../components/fortune/FortuneDetail';
import { IFortune } from '../../types/models';

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

  // 詳細表示の切り替え
  const handleViewDetail = () => {
    setShowDetail(true);
  };

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
  let headerBgColor = '#f44336'; // 火の色をデフォルトに

  switch(elementType) {
    case '木': headerBgColor = '#43a047'; break;
    case '火': headerBgColor = '#e53935'; break;
    case '土': headerBgColor = '#ff8f00'; break;
    case '金': headerBgColor = '#fdd835'; break;
    case '水': headerBgColor = '#1e88e5'; break;
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.palette.grey[100],
        pb: 10 // 下部ナビゲーション用のパディング
      }}
    >
      {/* ヘッダー - モックアップに合わせたデザイン */}
      <AppBar 
        position="sticky" 
        elevation={4}
        sx={{ 
          background: `linear-gradient(135deg, ${headerBgColor} 0%, ${headerBgColor}DD 100%)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <AutoGraphIcon sx={{ mr: 1.5 }} />
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
      <Container maxWidth="md" sx={{ mt: 3, mb: 4, animation: 'fadeIn 0.8s ease-out' }}>
        {showDetail ? (
          <>
            <FortuneDetail fortune={dailyFortune} />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleBackToSummary}
              >
                サマリーに戻る
              </Button>
            </Box>
          </>
        ) : (
          <>
            <DailyFortune onClickViewDetail={handleViewDetail} />
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

      {/* ボトムナビゲーション - モックアップに合わせて追加 */}
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
          <AutoGraphIcon sx={{ mb: 0.5, fontSize: '1.6rem' }} />
          <Typography variant="caption" fontWeight={500}>運勢</Typography>
        </Box>
        
        {['chat', 'route', 'diversity_3', 'person'].map((icon, index) => (
          <Box 
            key={index}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              padding: '12px 0',
              minWidth: '72px',
              flex: 1,
              color: theme.palette.text.secondary,
            }}
            component="a"
            href="#"
          >
            <Box component="span" className="material-icons" sx={{ mb: 0.5, fontSize: '1.6rem' }}>{icon}</Box>
            <Typography variant="caption" fontWeight={500}>
              {icon === 'chat' ? '対話' : 
               icon === 'route' ? 'キャリア' : 
               icon === 'diversity_3' ? 'チーム' : 'プロフィール'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

/**
 * デイリーフォーチュンページ
 */
const DailyFortunePage = () => (
  <FortuneProvider>
    <FortunePageContent />
  </FortuneProvider>
);

export default DailyFortunePage;