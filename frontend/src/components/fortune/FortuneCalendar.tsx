/**
 * フォーチュンカレンダーコンポーネント
 * モックアップに基づく新実装（ジョナサン・アイブデザイン）
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton,
  Chip,
  useTheme,
  Card,
  CardHeader,
  CardContent,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

import { IFortune } from '../../types/models';
import { useFortune } from '../../hooks/useFortune';

// 五行属性の色と背景色マッピング
const elementStyles = {
  '木': {
    color: '#43a047',
    bgColor: '#e8f5e9',
    gradient: 'linear-gradient(135deg, #81c784 0%, #43a047 100%)',
    textColor: '#fff'
  },
  '火': {
    color: '#e53935',
    bgColor: '#ffebee',
    gradient: 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)',
    textColor: '#fff'
  },
  '土': {
    color: '#ff8f00',
    bgColor: '#fff8e1',
    gradient: 'linear-gradient(135deg, #ffd54f 0%, #ff8f00 100%)',
    textColor: '#fff'
  },
  '金': {
    color: '#fdd835',
    bgColor: '#fffde7',
    gradient: 'linear-gradient(135deg, #ffee58 0%, #fdd835 100%)',
    textColor: '#212121'
  },
  '水': {
    color: '#1e88e5',
    bgColor: '#e3f2fd',
    gradient: 'linear-gradient(135deg, #64b5f6 0%, #1e88e5 100%)',
    textColor: '#fff'
  }
};

interface FortuneCalendarProps {
  onSelectDate: (fortune: IFortune) => void;
}

const FortuneCalendar: React.FC<FortuneCalendarProps> = ({ onSelectDate }) => {
  const theme = useTheme();
  const { weeklyFortunes, fetchWeeklyFortunes /* loading */ } = useFortune();
  const [currentStartDate, setCurrentStartDate] = useState<Date>(() => {
    // 今日の日付から週の開始日（日曜日）を計算
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 日曜日, 1: 月曜日, ...
    const diff = today.getDate() - dayOfWeek;
    return new Date(today.setDate(diff));
  });
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // 日付を文字列形式（YYYY-MM-DD）に変換
  const dateToString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // 今日の日付かどうかを判定
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // カレンダーを次の週/月に移動
  const handleNext = () => {
    const nextDate = new Date(currentStartDate);
    if (viewMode === 'week') {
      nextDate.setDate(currentStartDate.getDate() + 7);
    } else {
      nextDate.setMonth(currentStartDate.getMonth() + 1);
    }
    setCurrentStartDate(nextDate);
  };

  // カレンダーを前の週/月に移動
  const handlePrev = () => {
    const prevDate = new Date(currentStartDate);
    if (viewMode === 'week') {
      prevDate.setDate(currentStartDate.getDate() - 7);
    } else {
      prevDate.setMonth(currentStartDate.getMonth() - 1);
    }
    setCurrentStartDate(prevDate);
  };

  // 週の表示範囲を生成
  const getWeekDates = (): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentStartDate);
      date.setDate(currentStartDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // 月の表示範囲を生成
  const getMonthDates = (): Date[] => {
    const dates: Date[] = [];
    const firstDayOfMonth = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth() + 1, 0);
    
    // 月の最初の日の曜日（0:日曜日, 1:月曜日, ...）
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // 前月の日付を追加
    for (let i = firstDayOfWeek; i > 0; i--) {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    
    // 当月の日付を追加
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), i);
      dates.push(date);
    }
    
    // 翌月の日付を追加（6行×7列 = 42マスになるまで）
    const remainingDays = 42 - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(lastDayOfMonth);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // 指定日の運勢データを取得
  const getFortuneForDate = (date: Date): IFortune | undefined => {
    const dateStr = dateToString(date);
    return weeklyFortunes.find(fortune => fortune.date === dateStr);
  };

  // 日付が当月かどうかを判定
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentStartDate.getMonth();
  };

  // 表示モードの切り替え
  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'week' | 'month' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // 週/月の表示が変わったら運勢データを再取得
  useEffect(() => {
    const startDateStr = dateToString(currentStartDate);
    fetchWeeklyFortunes(startDateStr);
  }, [currentStartDate, fetchWeeklyFortunes]);

  // 現在の月表示
  const currentMonth = currentStartDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 3, 
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)'
        }
      }}
    >
      {/* ヘッダー部分 */}
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              運勢カレンダー
            </Typography>
          </Box>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handlePrev} size="small">
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mx: 2 }}>
              {currentMonth}
            </Typography>
            
            <IconButton onClick={handleNext} size="small">
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{ 
          backgroundColor: theme.palette.primary.light + '20',
          borderBottom: `1px solid ${theme.palette.grey[200]}`
        }}
      />

      <CardContent sx={{ p: 3 }}>
        {/* 表示モード切り替えボタン */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="カレンダー表示モード"
            size="small"
            sx={{ 
              bgcolor: 'white',
              borderRadius: '30px',
              overflow: 'hidden',
              border: `1px solid ${theme.palette.grey[300]}`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            <ToggleButton 
              value="week" 
              aria-label="週間" 
              sx={{ 
                px: 3, 
                py: 1,
                fontWeight: 500,
                border: 'none',
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }
              }}
            >
              週間
            </ToggleButton>
            <ToggleButton 
              value="month" 
              aria-label="月間" 
              sx={{ 
                px: 3, 
                py: 1,
                fontWeight: 500,
                border: 'none',
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }
              }}
            >
              月間
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* カレンダーグリッド - 曜日ヘッダー */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
          {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
            <Typography 
              key={index} 
              align="center" 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 500
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* カレンダーグリッド - 日付 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
          {(viewMode === 'week' ? getWeekDates() : getMonthDates()).map((date, index) => {
            const fortune = getFortuneForDate(date);
            const element = fortune?.sajuData?.mainElement || null;
            const score = fortune?.overallScore || 0;
            const elementStyle = element ? elementStyles[element as keyof typeof elementStyles] : null;
            const isCurrentDate = isToday(date);
            const isMonthDay = viewMode === 'month' && isCurrentMonth(date);
            
            return (
              <Paper
                key={index}
                elevation={isCurrentDate ? 2 : 0}
                sx={{
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  backgroundColor: viewMode === 'week' || isMonthDay ? theme.palette.grey[100] : theme.palette.grey[50],
                  opacity: viewMode === 'week' || isMonthDay ? 1 : 0.6,
                  borderRadius: 2,
                  cursor: fortune ? 'pointer' : 'default',
                  border: isCurrentDate ? `2px solid ${theme.palette.primary.main}` : 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': fortune ? {
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                    zIndex: 1
                  } : {}
                }}
                onClick={() => fortune && onSelectDate(fortune)}
              >
                {/* 日付表示 */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    color: theme.palette.text.secondary,
                    fontWeight: isCurrentDate ? 700 : 400
                  }}
                >
                  {date.getDate()}
                </Typography>

                {/* 五行属性と運勢スコア */}
                {element && elementStyle && (
                  <Box 
                    sx={{ 
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: elementStyle.gradient,
                      color: elementStyle.textColor,
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      mt: '6px',
                      transition: 'all 0.3s ease',
                      '.MuiPaper-root:hover &': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    {score}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>

        {/* 凡例 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: '12px', 
          mt: 3 
        }}>
          {Object.entries(elementStyles).map(([element, style], index) => (
            <Chip
              key={index}
              label={`${element}の日`}
              size="small"
              sx={{
                bgcolor: 'white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
              avatar={
                <Box 
                  sx={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    background: style.gradient,
                    ml: 1
                  }} 
                />
              }
            />
          ))}
        </Box>

        <Typography 
          align="center" 
          variant="caption" 
          color="text.secondary" 
          sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}
        >
          ※ 円内の数字はあなたの命式との相性スコア (100点満点)
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FortuneCalendar;