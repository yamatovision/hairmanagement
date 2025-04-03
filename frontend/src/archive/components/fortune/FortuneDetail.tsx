/**
 * フォーチュン詳細コンポーネント - 五行対応ダイナミック版
 */

import React, { useEffect } from 'react';
import { IFortune, ElementType } from '../../types/models';
import { Box, Card, CircularProgress, Typography, Paper } from '@mui/material';
import { useFortune } from '../../hooks/useFortune';

// 五行に対応する色とスタイル定義
const elementStyles = {
  '木': {
    background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
    color: '#fff',
    borderColor: '#2e7d32',
    icon: '🌳',
    secondaryColor: '#c8e6c9',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
  },
  '火': {
    background: 'linear-gradient(135deg, #f44336 0%, #b71c1c 100%)',
    color: '#fff',
    borderColor: '#d32f2f',
    icon: '🔥',
    secondaryColor: '#ffcdd2',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
  },
  '土': {
    background: 'linear-gradient(135deg, #ffa726 0%, #ef6c00 100%)',
    color: '#fff',
    borderColor: '#f57c00',
    icon: '🏔️',
    secondaryColor: '#ffe0b2',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
  },
  '金': {
    background: 'linear-gradient(135deg, #ffeb3b 0%, #f9a825 100%)',
    color: '#333',
    borderColor: '#fdd835',
    icon: '⚱️',
    secondaryColor: '#fff9c4',
    textShadow: 'none'
  },
  '水': {
    background: 'linear-gradient(135deg, #42a5f5 0%, #0d47a1 100%)',
    color: '#fff',
    borderColor: '#1976d2',
    icon: '💧',
    secondaryColor: '#bbdefb',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
  }
};

// デフォルトスタイル
const defaultStyle = {
  background: 'linear-gradient(135deg, #90a4ae 0%, #546e7a 100%)',
  color: '#fff',
  borderColor: '#78909c',
  icon: '✨',
  secondaryColor: '#eceff1',
  textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
};

interface FortuneDetailProps {
  fortune: IFortune | null;
}

const FortuneDetail: React.FC<FortuneDetailProps> = ({ fortune }) => {
  const { markFortuneAsViewed, formatDate, isToday } = useFortune();

  // 運勢を閲覧済みに設定
  useEffect(() => {
    if (fortune && !fortune.viewedAt) {
      markFortuneAsViewed(fortune.id);
    }
  }, [fortune, markFortuneAsViewed]);

  // ローディング表示
  if (!fortune) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // データを準備
  const { date, sajuData, personalGoal = '', teamGoal = '' } = fortune;
  const formattedDate = formatDate(date);
  const isTodayFortune = isToday(date);
  
  // 運勢データの表示（APIから取得した実データを使用）
  const dayMaster = sajuData?.dayMaster;
  const earthBranch = sajuData?.earthBranch;
  const tenGod = sajuData?.tenGod;
  const mainElement = sajuData?.mainElement;
  const dayElement = sajuData?.dayElement;
  
  // データがない場合は実行を止める（APIからデータが正しく取得できなかった場合）
  if (!dayMaster || !earthBranch || !tenGod || !mainElement || !dayElement) {
    console.error('運勢データが不完全です。必要なデータ:', {
      dayMaster, earthBranch, tenGod, mainElement, dayElement
    });
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">
          運勢データの取得に失敗しました。バックエンドAPIが正しく動作しているか確認してください。
        </Typography>
      </Box>
    );
  }
  const style = elementStyles[dayElement as keyof typeof elementStyles] || defaultStyle;

  return (
    <Card 
      elevation={4}
      sx={{ 
        overflow: 'hidden', 
        borderRadius: 2, 
        boxShadow: `0 4px 20px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px ${style.borderColor}`,
        position: 'relative'
      }}
    >
      {/* 五行アイコン背景（大きく薄く表示） */}
      <Box sx={{ 
        position: 'absolute', 
        top: '10%', 
        right: '5%', 
        fontSize: '150px', 
        opacity: 0.1,
        zIndex: 0,
        transform: 'rotate(15deg)'
      }}>
        {style.icon}
      </Box>

      {/* ヘッダー */}
      <Box sx={{ 
        p: 3, 
        background: style.background,
        color: style.color,
        textShadow: style.textShadow,
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Box component="span" sx={{ fontSize: '2rem' }}>{style.icon}</Box>
          <Typography variant="h5" fontWeight="bold">
            {isTodayFortune ? '今日' : formattedDate}の運勢
          </Typography>
        </Box>
        <Typography variant="h6" align="center" sx={{ mt: 1 }}>
          {dayElement}の気が強まる {dayMaster}{earthBranch}の日
        </Typography>
      </Box>
      
      {/* コンテンツ */}
      <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        {/* 基本情報 */}
        <Paper elevation={2} sx={{ 
          p: 2, 
          mb: 3, 
          bgcolor: style.secondaryColor,
          borderLeft: `4px solid ${style.borderColor}`
        }}>
          <Typography sx={{ fontWeight: 'medium' }}>
            あなたの四柱では、{mainElement}の気質を持つ「{dayMaster}」の日主で、「{earthBranch}」の地支との組み合わせです。
            今日は「{tenGod}」の気が強く、{dayElement}のエネルギーが際立つ一日です。
          </Typography>
        </Paper>
        
        {/* 個人目標 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            borderBottom: `2px solid ${style.borderColor}`,
            pb: 0.5
          }}>
            <Box component="span" sx={{ mr: 1, fontSize: '1.2rem' }}>👤</Box>
            <Typography variant="h6" fontWeight="bold">
              個人目標へのアドバイス
            </Typography>
          </Box>
          <Typography sx={{ pl: 1 }}>
            個人目標「{personalGoal}」に向けて、{dayMaster}の持つ明晰さを活かし、
            システムの核となる機能を再評価しましょう。余分な要素を削ぎ落として本質に集中する日です。
          </Typography>
        </Box>
        
        {/* チーム目標 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            borderBottom: `2px solid ${style.borderColor}`,
            pb: 0.5
          }}>
            <Box component="span" sx={{ mr: 1, fontSize: '1.2rem' }}>👥</Box>
            <Typography variant="h6" fontWeight="bold">
              チーム目標へのアドバイス
            </Typography>
          </Box>
          <Typography sx={{ pl: 1 }}>
            チーム目標「{teamGoal}」のために、今日はチーム内での役割分担の明確化と
            具体的なタイムラインの設定に最適です。財務面の詳細検証に注力しましょう。
          </Typography>
        </Box>
        
        {/* 行動ポイント */}
        <Box sx={{ 
          p: 2, 
          bgcolor: style.background, 
          borderRadius: 2,
          color: style.color,
          textShadow: style.textShadow
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1 
          }}>
            <Box component="span" sx={{ mr: 1, fontSize: '1.2rem' }}>🎯</Box>
            <Typography variant="h6" fontWeight="bold">
              今日の行動ポイント
            </Typography>
          </Box>
          <Box sx={{ pl: 4 }}>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>1.</Box>
              明晰な判断を優先し、複雑な問題を単純化する
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>2.</Box>
              迷いを捨て実行に移す
            </Typography>
            <Typography>
              <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>3.</Box>
              チームメンバーとの連携を強化する
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default FortuneDetail;