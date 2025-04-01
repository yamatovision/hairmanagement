/**
 * デイリーフォーチュンコンポーネント
 * 今日の運勢のサマリーを表示
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import React, { useState, useEffect } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
  Button,
  Chip,
  LinearProgress,
  Grid,
  IconButton,
  useTheme,
  Skeleton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useFortune } from '../../hooks/useFortune';
// import { ElementalType } from '../../shared/types';
// TypeScript型は直接定義して使用
type ElementType = '木' | '火' | '土' | '金' | '水';
type YinYangType = '陰' | '陽';
type ElementalType = {
  mainElement: ElementType;
  secondaryElement?: ElementType;
  yinYang: YinYangType;
};

interface DailyFortuneProps {
  onClickViewDetail: () => void;
}

/**
 * デイリーフォーチュンカード - 今日の運勢サマリー表示
 */
const DailyFortune: React.FC<DailyFortuneProps> = ({ onClickViewDetail }) => {
  const theme = useTheme();
  const { 
    dailyFortune, 
    fetchDailyFortune, 
    loading, 
    error, 
    getElementColor, 
    getElementTextColor,
    getElementKeywords,
    getLuckLevel,
    getCompatibleUsers
  } = useFortune();

  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // サブヘッダーの色を取得
  const getSubheaderColor = (score: number) => {
    if (score >= 80) return theme.palette.success.light;
    if (score >= 60) return theme.palette.success.main;
    if (score >= 40) return theme.palette.warning.light;
    if (score >= 20) return theme.palette.warning.main;
    return theme.palette.error.light;
  };

  // 運勢レベルの表示テキスト
  const getLuckLevelText = (score: number) => {
    const level = getLuckLevel(score);
    switch (level) {
      case 'excellent': return '絶好調';
      case 'good': return '好調';
      case 'average': return '普通';
      case 'challenging': return '要注意';
      case 'difficult': return '厳しい';
      default: return '普通';
    }
  };

  // 詳細表示の開閉を切り替え
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // 運勢を更新
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDailyFortune();
    setRefreshing(false);
  };

  // 読み込み中の表示
  if (loading && !dailyFortune) {
    return (
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={100} />
          <Skeleton variant="text" sx={{ mt: 2 }} />
          <Skeleton variant="text" />
        </CardContent>
      </Card>
    );
  }

  // エラー時の表示
  if (error && !dailyFortune) {
    return (
      <Card elevation={3} sx={{ mb: 3, bgcolor: theme.palette.error.light }}>
        <CardContent>
          <Typography variant="h6" color="error">
            運勢の取得に失敗しました
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mt: 2 }}
          >
            再試行
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 運勢データがない場合の表示
  if (!dailyFortune) {
    return (
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" align="center">
            今日の運勢はまだ取得されていません
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              運勢を取得
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // ここから運勢表示
  const {
    dailyElement = '木',
    yinYang = '陽',
    overallLuck = 50,
    careerLuck = 50,
    relationshipLuck = 50,
    creativeEnergyLuck = 50,
    healthLuck = 50,
    wealthLuck = 50,
    description,
    advice,
    compatibleElements = []
  } = dailyFortune;

  // 運勢要素の色を取得
  const elementColor = getElementColor(dailyElement);
  const elementTextColor = getElementTextColor(dailyElement);
  
  // 運勢要素のキーワードを取得
  const keywords = getElementKeywords(dailyElement);
  
  // 相性の良いユーザーを取得
  const compatibleUsers = getCompatibleUsers({ 
    mainElement: dailyElement, 
    yinYang: yinYang 
  });

  return (
    <Card elevation={3} sx={{ mb: 3, overflow: 'visible' }}>
      {/* ヘッダー部分 */}
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: elementColor, 
          color: elementTextColor,
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          今日の運勢
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="small" 
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ color: elementTextColor, mr: 1 }}
          >
            <RefreshIcon />
          </IconButton>
          <Chip 
            label={`${dailyElement}の日 (${yinYang})`} 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.85)', 
              color: elementTextColor,
              fontWeight: 'bold'
            }} 
          />
        </Box>
      </Box>
      
      {/* 運勢表示中の更新インジケーター */}
      {refreshing && <LinearProgress />}

      <CardContent>
        {/* 運勢スコアと属性 */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* 運勢スコア */}
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box 
              sx={{ 
                position: 'relative', 
                width: 100, 
                height: 100,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* 円グラフの背景 */}
              <CircularProgress 
                variant="determinate" 
                value={100} 
                size={100} 
                thickness={8} 
                sx={{ 
                  color: theme.palette.grey[200],
                  position: 'absolute'
                }}
              />
              
              {/* 実際の運勢スコア */}
              <CircularProgress 
                variant="determinate" 
                value={overallLuck} 
                size={100} 
                thickness={8}
                sx={{ 
                  color: getSubheaderColor(overallLuck),
                  position: 'absolute'
                }}
              />
              
              {/* スコア中央表示 */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center'
                }}
              >
                <Typography variant="h4" component="div" fontWeight="bold">
                  {overallLuck}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getLuckLevelText(overallLuck)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* 運勢説明 */}
          <Grid item xs={12} sm={8}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {description ? description.split('\n')[0] : `今日は${dailyElement}の気が強い日です。${getLuckLevelText(overallLuck)}でしょう。`}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {keywords.map((keyword, index) => (
                <Chip 
                  key={index} 
                  label={keyword} 
                  size="small" 
                  sx={{ 
                    bgcolor: `${elementColor}50`,
                    color: elementTextColor
                  }} 
                />
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* カテゴリ別運勢スコア */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            分野別運勢スコア
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                キャリア運
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={careerLuck} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  mb: 1,
                  bgcolor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getSubheaderColor(careerLuck)
                  }
                }} 
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                人間関係運
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={relationshipLuck} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  mb: 1,
                  bgcolor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getSubheaderColor(relationshipLuck)
                  }
                }} 
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                創造力運
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={creativeEnergyLuck} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  mb: 1,
                  bgcolor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getSubheaderColor(creativeEnergyLuck)
                  }
                }} 
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                健康運
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={healthLuck} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  mb: 1,
                  bgcolor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getSubheaderColor(healthLuck)
                  }
                }} 
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                金運
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={wealthLuck} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getSubheaderColor(wealthLuck)
                  }
                }} 
              />
            </Grid>
          </Grid>
        </Box>

        {/* 詳細情報（折りたたみ可能） */}
        {expanded && (
          <>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              今日のアドバイス
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {advice || `${dailyElement}の特性を活かして、${getLuckLevelText(overallLuck)}な一日を過ごすためのポイントを意識しましょう。`}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              相性の良い五行
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {compatibleElements && compatibleElements.map((element, index) => (
                <Chip 
                  key={index} 
                  label={element} 
                  size="small" 
                  sx={{ 
                    bgcolor: getElementColor(element),
                    color: getElementTextColor(element)
                  }} 
                />
              ))}
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              今日の相性が良いチームメンバー
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {compatibleUsers.map((name, index) => (
                <Chip 
                  key={index} 
                  label={name} 
                  size="small" 
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </>
        )}
        
        {/* フッターボタン */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2 
          }}
        >
          <Button 
            size="small" 
            onClick={toggleExpanded}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? '折りたたむ' : 'もっと見る'}
          </Button>
          
          <Button 
            size="small" 
            color="primary" 
            variant="contained"
            onClick={onClickViewDetail}
            startIcon={<VisibilityIcon />}
          >
            詳細を見る
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DailyFortune;