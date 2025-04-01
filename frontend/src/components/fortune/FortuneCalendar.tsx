/**
 * フォーチュンカレンダーコンポーネント
 * 週間・月間単位で運勢カレンダーを表示
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  IconButton, 
  Chip,
  useTheme
} from '@mui/material';
import { 
  ArrowBackIos as ArrowBackIosIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useFortune } from '../../hooks/useFortune';
import { IFortune, ELEMENT_PROPERTIES } from '../../utils/sharedTypes';

// エラーハンドリング用の拡張FortuneType
type FortuneWithErrorType = IFortune & {
  error?: boolean;
  message?: string;
};

interface FortuneCalendarProps {
  onSelectDate: (fortune: IFortune) => void;
}

/**
 * 日付範囲の運勢カレンダーを表示するコンポーネント
 */
const FortuneCalendar: React.FC<FortuneCalendarProps> = ({ onSelectDate }) => {
  const theme = useTheme();
  const { 
    weeklyFortunes, 
    fetchWeeklyFortunes, 
    loading, 
    isToday, 
    getElementColor 
  } = useFortune();
  
  const [currentStartDate, setCurrentStartDate] = useState<Date>(() => {
    // 今日の日付から週の開始日（日曜日）を計算
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 日曜日, 1: 月曜日, ...
    const diff = today.getDate() - dayOfWeek;
    return new Date(today.setDate(diff));
  });

  // 日付を文字列形式（YYYY-MM-DD）に変換
  const dateToString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // カレンダーを次の週に移動
  const handleNextWeek = () => {
    const nextWeek = new Date(currentStartDate);
    nextWeek.setDate(currentStartDate.getDate() + 7);
    setCurrentStartDate(nextWeek);
  };

  // カレンダーを前の週に移動
  const handlePrevWeek = () => {
    const prevWeek = new Date(currentStartDate);
    prevWeek.setDate(currentStartDate.getDate() - 7);
    setCurrentStartDate(prevWeek);
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

  // 指定日の運勢データを取得
  const getFortuneForDate = (date: Date): IFortune | undefined => {
    const dateStr = dateToString(date);
    return weeklyFortunes.find(fortune => fortune.date === dateStr);
  };

  // 週の表示が変わったら運勢データを再取得
  useEffect(() => {
    const startDateStr = dateToString(currentStartDate);
    fetchWeeklyFortunes(startDateStr);
  }, [currentStartDate, fetchWeeklyFortunes]);

  // 現在の月表示
  const currentMonth = currentStartDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });

  // エラーを検出
  const hasError = weeklyFortunes.length === 1 && weeklyFortunes[0]?.error === true;
  const errorMessage = hasError ? weeklyFortunes[0]?.message : null;

  // エラーがある場合はエラーメッセージを表示
  if (hasError) {
    return (
      <Box sx={{ mt: 3, mb: 4 }}>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            bgcolor: '#fff3e0', 
            borderLeft: '4px solid #ff9800',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            運勢カレンダーの表示ができません
          </Typography>
          <Typography variant="body1" paragraph>
            {errorMessage || '生年月日が設定されていません。プロフィール設定画面で生年月日を登録してください。'}
          </Typography>
          <Chip 
            label="プロフィール設定へ" 
            color="primary" 
            onClick={() => window.location.href = '/profile'}
            sx={{ cursor: 'pointer', mt: 1 }}
          />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3, mb: 4 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}
      >
        <IconButton 
          onClick={handlePrevWeek}
          size="small"
          sx={{ color: theme.palette.text.secondary }}
        >
          <ArrowBackIosIcon fontSize="small" />
        </IconButton>
        
        <Typography 
          variant="h6" 
          align="center"
          sx={{ fontWeight: 500 }}
        >
          {currentMonth}
        </Typography>
        
        <IconButton 
          onClick={handleNextWeek}
          size="small"
          sx={{ color: theme.palette.text.secondary }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Box>

      <Grid container spacing={1}>
        {getWeekDates().map((date, index) => {
          const fortune = getFortuneForDate(date);
          const dateStr = date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit', weekday: 'short' });
          const element = fortune?.dailyElement || '木';
          const elementColor = getElementColor(element);
          const luckScore = fortune?.overallLuck || 50;
          const viewed = !!fortune?.viewedAt;
          const isCurrentDay = isToday(dateToString(date));
          
          return (
            <Grid item xs={12/7} key={index}>
              <Paper 
                elevation={isCurrentDay ? 3 : 1}
                sx={{ 
                  p: 1, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: fortune ? 'pointer' : 'default',
                  border: isCurrentDay ? `2px solid ${theme.palette.primary.main}` : 'none',
                  opacity: fortune ? 1 : 0.6,
                  transition: 'all 0.2s',
                  '&:hover': fortune ? {
                    boxShadow: 3,
                    transform: 'translateY(-2px)'
                  } : {}
                }}
                onClick={() => fortune && onSelectDate(fortune)}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: isCurrentDay ? 'bold' : 'normal',
                    color: isCurrentDay ? theme.palette.primary.main : theme.palette.text.primary
                  }}
                >
                  {dateStr}
                </Typography>
                
                {fortune && (
                  <>
                    <Box 
                      sx={{ 
                        width: 25, 
                        height: 25, 
                        borderRadius: '50%', 
                        backgroundColor: elementColor,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: 1,
                        mb: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: ELEMENT_PROPERTIES[element as keyof typeof ELEMENT_PROPERTIES].textColor
                      }}
                    >
                      {element}
                    </Box>
                    
                    <Chip 
                      size="small"
                      label={`${luckScore}`}
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        backgroundColor: luckScore >= 70 
                          ? '#a5d6a7' 
                          : luckScore >= 50 
                            ? '#fff59d' 
                            : '#ffab91'
                      }}
                    />
                    
                    <Box 
                      sx={{ 
                        mt: 'auto', 
                        pt: 0.5, 
                        fontSize: '0.7rem', 
                        color: theme.palette.text.secondary,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {viewed 
                        ? <VisibilityIcon fontSize="inherit" sx={{ mr: 0.5 }} /> 
                        : <VisibilityOffIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                      }
                      {viewed ? '既読' : '未読'}
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default FortuneCalendar;