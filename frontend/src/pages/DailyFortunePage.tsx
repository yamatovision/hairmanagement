/**
 * デイリーフォーチュンページ
 * 運勢表示のメインページ
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  Button, 
  CircularProgress,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  CalendarMonth as CalendarMonthIcon,
  ViewDay as ViewDayIcon
} from '@mui/icons-material';

import { FortuneProvider, useFortune } from '../contexts/FortuneContext';
import DailyFortune from '../components/fortune/DailyFortune';
import FortuneDetail from '../components/fortune/FortuneDetail';
import FortuneCalendar from '../components/fortune/FortuneCalendar';
import { IFortune } from '../utils/sharedTypes';

// タブパネルの型定義
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// タブパネルコンポーネント
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`fortune-tabpanel-${index}`}
      aria-labelledby={`fortune-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// アクセシビリティ用のprops
const a11yProps = (index: number) => {
  return {
    id: `fortune-tab-${index}`,
    'aria-controls': `fortune-tabpanel-${index}`,
  };
};

/**
 * フォーチュンページの内部コンテンツ
 */
const FortunePageContent = () => {
  const theme = useTheme();
  const { 
    dailyFortune, 
    selectedFortune, 
    selectFortune,
    fetchDailyFortune, 
    fetchWeeklyFortunes,
    loading, 
    error 
  } = useFortune();
  
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // ページ読み込み時にデータ取得
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchDailyFortune();
        await fetchWeeklyFortunes();
      } catch (err) {
        console.error('フォーチュンデータの初期読み込みエラー:', err);
      }
    };
    
    loadData();
  }, [fetchDailyFortune, fetchWeeklyFortunes]);

  // タブ切り替え
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 詳細表示へ
  const handleViewDetail = () => {
    if (dailyFortune) {
      selectFortune(dailyFortune);
      setTabValue(1);
    }
  };

  // 日付選択
  const handleSelectDate = (fortune: IFortune) => {
    selectFortune(fortune);
    setTabValue(1);
  };

  // データの手動更新
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDailyFortune();
      await fetchWeeklyFortunes();
    } catch (err) {
      console.error('フォーチュンデータの更新エラー:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // 読み込み中表示
  if (loading && !dailyFortune && !refreshing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  // エラー表示
  if (error && !dailyFortune && !refreshing) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              再試行
            </Button>
          }
          sx={{ mb: 2 }}
        >
          運勢データの取得に失敗しました: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* ページヘッダー */}
      <Box 
        sx={{ 
          backgroundColor: theme.palette.primary.main, 
          color: theme.palette.primary.contrastText,
          py: 2,
          mb: 3
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h5" component="h1" fontWeight="bold">
            陰陽五行デイリーフォーチュン
          </Typography>
          <Typography variant="body2">
            あなたの個性と日々の運勢を陰陽五行の視点から読み解きます
          </Typography>
        </Container>
      </Box>

      {/* メインコンテンツ */}
      <Container maxWidth="md">
        {/* タブナビゲーション */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="運勢タブ"
            variant="fullWidth"
          >
            <Tab 
              label="デイリー運勢" 
              icon={<ViewDayIcon />} 
              iconPosition="start"
              {...a11yProps(0)} 
            />
            <Tab 
              label="運勢詳細" 
              icon={<CalendarMonthIcon />} 
              iconPosition="start"
              {...a11yProps(1)} 
              disabled={!selectedFortune}
            />
          </Tabs>
        </Box>

        {/* タブコンテンツ */}
        <TabPanel value={tabValue} index={0}>
          <DailyFortune onClickViewDetail={handleViewDetail} />
          <FortuneCalendar onSelectDate={handleSelectDate} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <FortuneDetail fortune={selectedFortune} />
        </TabPanel>

        {/* ローディングインジケーター */}
        {refreshing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Container>
    </Box>
  );
};

/**
 * デイリーフォーチュンページ
 * FortuneProviderでラップしてコンテキストを提供
 */
const DailyFortunePage: React.FC = () => {
  return (
    <FortuneProvider>
      <FortunePageContent />
    </FortuneProvider>
  );
};

export default DailyFortunePage;