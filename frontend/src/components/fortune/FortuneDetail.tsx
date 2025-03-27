/**
 * フォーチュン詳細コンポーネント
 * 選択された日の運勢詳細を表示
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import React, { useEffect } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Grid,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Lightbulb as LightbulbIcon,
  FitnessCenter as FitnessCenterIcon,
  AttachMoney as AttachMoneyIcon,
  Palette as PaletteIcon,
  Explore as ExploreIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { useFortune } from '../../hooks/useFortune';
import { IFortune, ELEMENT_PROPERTIES, YIN_YANG_PROPERTIES } from '../../utils/sharedTypes';

interface FortuneDetailProps {
  fortune: IFortune | null;
}

/**
 * 運勢詳細情報を表示するコンポーネント
 */
const FortuneDetail: React.FC<FortuneDetailProps> = ({ fortune }) => {
  const theme = useTheme();
  const { 
    markFortuneAsViewed, 
    formatDate, 
    isToday, 
    getElementColor, 
    getElementTextColor 
  } = useFortune();

  // 運勢の要素色を取得
  const elementColor = fortune 
    ? getElementColor(fortune.dailyElement) 
    : theme.palette.grey[300];
  
  // 運勢の要素テキスト色を取得
  const elementTextColor = fortune 
    ? getElementTextColor(fortune.dailyElement) 
    : theme.palette.grey[800];

  // 運勢の円グラフサイズ
  const chartSize = 120;

  // 運勢スコアの表示スタイルを取得
  const getLuckScoreStyle = (score: number) => {
    if (score >= 80) return { color: '#2e7d32', label: '絶好調' }; // 緑 - 最高
    if (score >= 60) return { color: '#689f38', label: '好調' };   // 薄緑 - 良い
    if (score >= 40) return { color: '#fbc02d', label: '普通' };   // 黄色 - 普通
    if (score >= 20) return { color: '#f57c00', label: '要注意' }; // オレンジ - 注意
    return { color: '#d32f2f', label: '厳しい' };                  // 赤 - 悪い
  };

  // ページ表示時に運勢を閲覧済みに設定（まだ閲覧済みでない場合）
  useEffect(() => {
    if (fortune && !fortune.viewedAt) {
      markFortuneAsViewed(fortune.id);
    }
  }, [fortune, markFortuneAsViewed]);

  // 運勢データがない場合の表示
  if (!fortune) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 400,
          bgcolor: 'background.paper',
          borderRadius: 1
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  // 運勢表示用のデータを抽出
  const {
    date,
    dailyElement,
    yinYang,
    overallLuck,
    careerLuck,
    relationshipLuck,
    creativeEnergyLuck,
    healthLuck,
    wealthLuck,
    description,
    advice,
    luckyColors,
    luckyDirections,
    compatibleElements,
    incompatibleElements
  } = fortune;

  // 運勢の日付表示
  const formattedDate = formatDate(date);
  const isTodayFortune = isToday(date);

  // 運勢スコアスタイル
  const overallScoreStyle = getLuckScoreStyle(overallLuck);
  
  // 陰陽の特性を取得
  const yinYangProps = YIN_YANG_PROPERTIES[yinYang as keyof typeof YIN_YANG_PROPERTIES];

  // 運勢要素の特性を取得
  const elementProps = ELEMENT_PROPERTIES[dailyElement as keyof typeof ELEMENT_PROPERTIES];

  return (
    <Card elevation={3} sx={{ overflow: 'visible', mb: 4 }}>
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
          {isTodayFortune ? '今日' : formattedDate}の運勢
        </Typography>
        <Chip 
          label={`${dailyElement}の日 (${yinYang})`} 
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.85)', 
            color: elementTextColor,
            fontWeight: 'bold'
          }} 
        />
      </Box>

      <CardContent>
        <Grid container spacing={2}>
          {/* 運勢スコア円グラフ */}
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box 
              sx={{ 
                position: 'relative', 
                width: chartSize, 
                height: chartSize,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* 円グラフの背景 */}
              <CircularProgress 
                variant="determinate" 
                value={100} 
                size={chartSize} 
                thickness={5} 
                sx={{ 
                  color: theme.palette.grey[200],
                  position: 'absolute'
                }}
              />
              
              {/* 実際の運勢スコア */}
              <CircularProgress 
                variant="determinate" 
                value={overallLuck} 
                size={chartSize} 
                thickness={5}
                sx={{ 
                  color: overallScoreStyle.color,
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
                <Typography variant="h4" component="div" color={overallScoreStyle.color} fontWeight="bold">
                  {overallLuck}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {overallScoreStyle.label}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* 運勢説明 */}
          <Grid item xs={12} sm={8}>
            <Typography variant="body1" gutterBottom>
              {description}
            </Typography>
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" color={elementTextColor}>
                アドバイス:
              </Typography>
              <Typography variant="body2">
                {advice}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 各カテゴリの運勢スコア */}
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          各分野の運勢スコア
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2.4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ color: getLuckScoreStyle(careerLuck).color, mb: 1 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                キャリア運
              </Typography>
              <Typography variant="h6" color={getLuckScoreStyle(careerLuck).color} fontWeight="bold">
                {careerLuck}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <PeopleIcon sx={{ color: getLuckScoreStyle(relationshipLuck).color, mb: 1 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                人間関係運
              </Typography>
              <Typography variant="h6" color={getLuckScoreStyle(relationshipLuck).color} fontWeight="bold">
                {relationshipLuck}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <LightbulbIcon sx={{ color: getLuckScoreStyle(creativeEnergyLuck).color, mb: 1 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                創造力運
              </Typography>
              <Typography variant="h6" color={getLuckScoreStyle(creativeEnergyLuck).color} fontWeight="bold">
                {creativeEnergyLuck}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FitnessCenterIcon sx={{ color: getLuckScoreStyle(healthLuck).color, mb: 1 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                健康運
              </Typography>
              <Typography variant="h6" color={getLuckScoreStyle(healthLuck).color} fontWeight="bold">
                {healthLuck}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AttachMoneyIcon sx={{ color: getLuckScoreStyle(wealthLuck).color, mb: 1 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                金運
              </Typography>
              <Typography variant="h6" color={getLuckScoreStyle(wealthLuck).color} fontWeight="bold">
                {wealthLuck}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* ラッキーポイントと相性 */}
        <Grid container spacing={3}>
          {/* ラッキー情報 */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              ラッキーポイント
            </Typography>
            
            {/* ラッキーカラー */}
            <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
              <PaletteIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                ラッキーカラー:
              </Typography>
              {luckyColors && luckyColors.map((color, index) => (
                <Chip 
                  key={index} 
                  label={color} 
                  size="small" 
                  sx={{ mr: 0.5, fontSize: '0.7rem' }} 
                />
              ))}
            </Box>
            
            {/* ラッキー方角 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ExploreIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                ラッキー方角:
              </Typography>
              {luckyDirections && luckyDirections.map((direction, index) => (
                <Chip 
                  key={index} 
                  label={direction} 
                  size="small" 
                  sx={{ mr: 0.5, fontSize: '0.7rem' }} 
                />
              ))}
            </Box>
          </Grid>

          {/* 相性情報 */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              相性
            </Typography>
            
            {/* 相性の良い属性 */}
            <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
              <ThumbUpIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                相性が良い:
              </Typography>
              {compatibleElements && compatibleElements.map((element, index) => (
                <Chip 
                  key={index} 
                  label={element} 
                  size="small" 
                  sx={{ 
                    mr: 0.5, 
                    fontSize: '0.7rem',
                    bgcolor: getElementColor(element),
                    color: getElementTextColor(element)
                  }} 
                />
              ))}
            </Box>
            
            {/* 相性の悪い属性 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ThumbDownIcon fontSize="small" sx={{ mr: 1, color: theme.palette.error.main }} />
              <Typography variant="body2" component="span" sx={{ mr: 1 }}>
                相性が悪い:
              </Typography>
              {incompatibleElements && incompatibleElements.map((element, index) => (
                <Chip 
                  key={index} 
                  label={element} 
                  size="small" 
                  sx={{ 
                    mr: 0.5, 
                    fontSize: '0.7rem',
                    bgcolor: getElementColor(element),
                    color: getElementTextColor(element)
                  }} 
                />
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* 陰陽五行の特性 */}
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {dailyElement}の特性
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {elementProps.keywords.map((keyword, index) => (
                <Chip 
                  key={index} 
                  label={keyword} 
                  size="small" 
                  sx={{ 
                    bgcolor: `${elementColor}80`,
                    color: elementTextColor
                  }} 
                />
              ))}
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>季節:</strong> {elementProps.season}　
              <strong>方角:</strong> {elementProps.direction}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {yinYang}の特性
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {yinYangProps.traits.map((trait, index) => (
                <Chip 
                  key={index} 
                  label={trait} 
                  size="small" 
                  sx={{ 
                    bgcolor: yinYang === '陰' ? '#2c3e5080' : '#f1c40f80',
                    color: yinYang === '陰' ? '#ffffff' : '#000000'
                  }} 
                />
              ))}
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>エネルギー:</strong> {yinYangProps.energy}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FortuneDetail;