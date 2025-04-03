/**
 * フォーチュン詳細コンポーネント
 * モックアップに基づく新実装（ジョナサン・アイブデザイン）
 */

import React, { useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  CircularProgress, 
  Paper,
  Button,
  List,
  ListItem,
  useTheme
} from '@mui/material';
import { 
  LocalFireDepartment as FireIcon,
  Pets as WoodIcon,
  Terrain as EarthIcon,
  Euro as MetalIcon,
  Water as WaterIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  Flag as FlagIcon
} from '@mui/icons-material';

import { IFortune } from '../../types/models';
import { useFortune } from '../../hooks/useFortune';

// 五行属性のスタイル定義
const elementStyles = {
  '木': {
    icon: <WoodIcon sx={{ fontSize: '1.4rem' }} />,
    background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
    color: '#fff',
    borderColor: '#2e7d32',
    emoji: '🌳',
    secondaryColor: '#c8e6c9',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
  },
  '火': {
    icon: <FireIcon sx={{ fontSize: '1.4rem' }} />,
    background: 'linear-gradient(135deg, #f44336 0%, #b71c1c 100%)',
    color: '#fff',
    borderColor: '#d32f2f',
    emoji: '🔥',
    secondaryColor: '#ffcdd2',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
  },
  '土': {
    icon: <EarthIcon sx={{ fontSize: '1.4rem' }} />,
    background: 'linear-gradient(135deg, #ffa726 0%, #ef6c00 100%)',
    color: '#fff',
    borderColor: '#f57c00',
    emoji: '🏔️',
    secondaryColor: '#ffe0b2',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
  },
  '金': {
    icon: <MetalIcon sx={{ fontSize: '1.4rem' }} />,
    background: 'linear-gradient(135deg, #ffeb3b 0%, #f9a825 100%)',
    color: '#333',
    borderColor: '#fdd835',
    emoji: '⚱️',
    secondaryColor: '#fff9c4',
    textShadow: 'none'
  },
  '水': {
    icon: <WaterIcon sx={{ fontSize: '1.4rem' }} />,
    background: 'linear-gradient(135deg, #42a5f5 0%, #0d47a1 100%)',
    color: '#fff',
    borderColor: '#1976d2',
    emoji: '💧',
    secondaryColor: '#bbdefb',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
  }
};

// デフォルトスタイル
const defaultStyle = {
  icon: null,
  background: 'linear-gradient(135deg, #90a4ae 0%, #546e7a 100%)',
  color: '#fff',
  borderColor: '#78909c',
  emoji: '✨',
  secondaryColor: '#eceff1',
  textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
};

interface FortuneDetailProps {
  fortune: IFortune | null;
}

const FortuneDetail: React.FC<FortuneDetailProps> = ({ fortune }) => {
  const theme = useTheme();
  const { markFortuneAsViewed, isToday } = useFortune();

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
  const { date, sajuData, personalGoal = '', teamGoal = '', advice = '', aiGeneratedAdvice } = fortune;
  const formattedDate = new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  const isTodayFortune = isToday(date);
  
  // 運勢データの表示（APIから取得した実データを使用）
  const dayMaster = sajuData?.dayMaster || '丙';
  const earthBranch = sajuData?.earthBranch || '午';
  const tenGod = sajuData?.tenGod || '偏印';
  const mainElement = sajuData?.mainElement || '火';
  const dayElement = sajuData?.dayElement || '火';
  
  // API生成アドバイスデータを使用（なければフォールバック値）
  const summaryAdvice = aiGeneratedAdvice?.summary || advice;
  const personalAdviceTxt = aiGeneratedAdvice?.personalAdvice || '';
  const teamAdviceTxt = aiGeneratedAdvice?.teamAdvice || '';
  
  // ラッキーポイントデータの準備
  // APIからのデータがあればそれを使用し、なければ五行に基づいた妥当なデフォルト値を設定
  const luckyPoints = aiGeneratedAdvice?.luckyPoints ? {
    color: aiGeneratedAdvice.luckyPoints.color || '',
    items: Array.isArray(aiGeneratedAdvice.luckyPoints.items) ? aiGeneratedAdvice.luckyPoints.items : ['鈴'],
    number: aiGeneratedAdvice.luckyPoints.number || 8,
    action: aiGeneratedAdvice.luckyPoints.action || '朝日を浴びる'
  } : {
    color: dayElement === '火' ? '赤' : dayElement === '木' ? '緑' : dayElement === '水' ? '青' : dayElement === '土' ? '黄' : '白',
    items: ['アクセサリー'],
    number: (Math.floor(Math.random() * 9) + 1),
    action: '新しいアイデアを書き出す'
  };
  
  // ラッキーポイントの詳細をログ出力（デバッグ用）
  console.log('Lucky Points Data:', {
    fromAPI: !!aiGeneratedAdvice?.luckyPoints,
    data: luckyPoints,
    itemsIsArray: Array.isArray(luckyPoints.items),
    itemsLength: Array.isArray(luckyPoints.items) ? luckyPoints.items.length : 'not array'
  });
  
  // 詳細をログ出力（デバッグ用）
  console.log('FortuneDetail Data:', { 
    hasAiGeneratedAdvice: !!aiGeneratedAdvice,
    luckyPoints: luckyPoints,
    date: date
  });
  
  // スタイル設定
  const style = elementStyles[dayElement as keyof typeof elementStyles] || defaultStyle;

  // アクションポイント - ラッキーポイント情報を活用
  const actionPoints = luckyPoints ? [
    `${luckyPoints.color}色のアイテムを身につける`,
    luckyPoints.items.length > 0 ? `${luckyPoints.items[0]}を活用する` : "自然物に触れる",
    luckyPoints.action
  ] : [
    "明晰な判断を優先し、複雑な問題を単純化する",
    "迷いを捨て実行に移す",
    "チームメンバーとの連携を強化する"
  ];

  return (
    <Card 
      elevation={4}
      sx={{ 
        overflow: 'hidden', 
        borderRadius: 3, 
        boxShadow: `0 4px 20px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px ${style.borderColor}`,
        position: 'relative',
        animation: 'fadeIn 0.8s ease-out'
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
        {style.emoji}
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
          <Box component="span" sx={{ fontSize: '2rem' }}>{style.emoji}</Box>
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
          p: 2.5, 
          mb: 3, 
          bgcolor: style.secondaryColor,
          borderLeft: `4px solid ${style.borderColor}`,
          borderRadius: 2
        }}>
          <Typography sx={{ fontWeight: 'medium', lineHeight: 1.7 }}>
            あなたの四柱では、{mainElement}の気質を持つ「{dayMaster}」の日主で、「{earthBranch}」の地支との組み合わせです。
            今日は「{tenGod}」の気が強く、{dayElement}のエネルギーが際立つ一日です。
          </Typography>
        </Paper>
        
        {/* 個人目標 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5,
            borderBottom: `2px solid ${style.borderColor}`,
            pb: 0.5
          }}>
            <PersonIcon sx={{ mr: 1.5, color: style.borderColor }} />
            <Typography variant="h6" fontWeight="bold">
              個人目標へのアドバイス
            </Typography>
          </Box>
          <Typography sx={{ pl: 1, lineHeight: 1.7, fontSize: '1rem' }}>
            個人目標「{personalGoal || "最高のAISAASを作る"}」に向けて、
            {personalAdviceTxt || `${dayMaster}の持つ明晰さを活かし、システムの核となる機能を再評価しましょう。余分な要素を削ぎ落として本質に集中する日です。`}
          </Typography>
        </Box>
        
        {/* チーム目標 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5,
            borderBottom: `2px solid ${style.borderColor}`,
            pb: 0.5
          }}>
            <GroupsIcon sx={{ mr: 1.5, color: style.borderColor }} />
            <Typography variant="h6" fontWeight="bold">
              チーム目標へのアドバイス
            </Typography>
          </Box>
          <Typography sx={{ pl: 1, lineHeight: 1.7, fontSize: '1rem' }}>
            チーム目標「{teamGoal || "年内30億円規模でバイアウト"}」のために、
            {teamAdviceTxt || "今日はチーム内での役割分担の明確化と具体的なタイムラインの設定に最適です。財務面の詳細検証に注力しましょう。"}
          </Typography>
        </Box>
        
        {/* ラッキーポイント */}
        {luckyPoints && (
          <Box sx={{ 
            p: 3, 
            bgcolor: `${style.secondaryColor}50`, 
            borderRadius: 2,
            borderLeft: `4px solid ${style.borderColor}`,
            mb: 3,
            boxShadow: `0 4px 12px ${style.color}20`
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2
            }}>
              <Box component="span" sx={{ mr: 1.5, fontSize: '1.5rem' }}>✨</Box>
              <Typography variant="h6" fontWeight="bold" color={style.color}>
                今日のラッキーポイント
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              {/* ラッキーカラー */}
              <Box sx={{ 
                flex: '1 1 200px',
                p: 2, 
                bgcolor: 'white', 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body2" color="text.secondary" mb={1}>ラッキーカラー</Typography>
                <Box sx={{ 
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: luckyPoints.color === '赤' ? '#e53935' : 
                          luckyPoints.color === '青' ? '#1e88e5' : 
                          luckyPoints.color === '緑' ? '#43a047' : 
                          luckyPoints.color === '黄' ? '#fdd835' : 
                          luckyPoints.color === '白' ? '#eeeeee' : 
                          luckyPoints.color === '紫' ? '#8e24aa' : 
                          luckyPoints.color === '茶' ? '#8d6e63' : 
                          luckyPoints.color === '橙' ? '#fb8c00' : 
                          luckyPoints.color === 'オレンジ' ? '#fb8c00' : 
                          luckyPoints.color === 'ピンク' ? '#ec407a' : 
                          luckyPoints.color === '水色' ? '#4fc3f7' : 
                          luckyPoints.color === '金' ? '#ffd54f' : 
                          luckyPoints.color === '銀' ? '#e0e0e0' : '#9e9e9e',
                  mb: 1,
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }} />
                <Typography variant="body1" fontWeight="medium">{luckyPoints.color}</Typography>
              </Box>
              
              {/* ラッキーアイテム */}
              <Box sx={{ 
                flex: '1 1 200px',
                p: 2, 
                bgcolor: 'white', 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body2" color="text.secondary" mb={1}>ラッキーアイテム</Typography>
                <Box sx={{ fontSize: '2rem', mb: 1 }}>🎁</Box>
                <Typography variant="body1" fontWeight="medium" textAlign="center">
                  {Array.isArray(luckyPoints.items) && luckyPoints.items.length > 0 
                    ? luckyPoints.items.join('、') 
                    : '鈴'}
                </Typography>
              </Box>
              
              {/* ラッキーナンバー */}
              <Box sx={{ 
                flex: '1 1 200px',
                p: 2, 
                bgcolor: 'white', 
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body2" color="text.secondary" mb={1}>ラッキーナンバー</Typography>
                <Box sx={{ 
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: style.background,
                  color: style.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  mb: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                  {luckyPoints.number}
                </Box>
                <Typography variant="body1" fontWeight="medium">{luckyPoints.number}</Typography>
              </Box>
            </Box>
            
            {/* 開運アクション */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'white', 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              <Box sx={{ fontSize: '1.8rem' }}>🚀</Box>
              <Box>
                <Typography variant="body2" color="text.secondary">開運アクション</Typography>
                <Typography variant="body1" fontWeight="medium">{luckyPoints.action}</Typography>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* 行動ポイント */}
        <Box sx={{ 
          p: 3, 
          bgcolor: style.background, 
          borderRadius: 2,
          color: style.color,
          textShadow: style.textShadow,
          mb: 3
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1.5 
          }}>
            <FlagIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">
              今日の行動ポイント
            </Typography>
          </Box>
          <List disablePadding sx={{ pl: 1 }}>
            {actionPoints.map((point, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  px: 2, 
                  py: 0.7, 
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.3)', 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mr: 2,
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    flexShrink: 0,
                    mt: 0.3
                  }}
                >
                  {index + 1}
                </Box>
                <Typography>
                  {point}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* ラッキーポイント */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2.5, 
            borderRadius: 2,
            borderLeft: `4px solid ${style.borderColor}`,
            bgcolor: theme.palette.grey[50],
            mb: 3
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            <Box component="span" sx={{ mr: 1, fontSize: '1.4rem' }}>✨</Box>
            今日のラッキーポイント
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Box sx={{ 
              flex: '1 1 200px', 
              p: 2, 
              border: `1px solid ${style.borderColor}30`,
              borderRadius: 2,
              bgcolor: `${style.secondaryColor}50`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                ラッキーカラー
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: luckyPoints.color === '赤' ? '#e53935' : 
                        luckyPoints.color === '青' ? '#1e88e5' : 
                        luckyPoints.color === '緑' ? '#43a047' : 
                        luckyPoints.color === '黄' ? '#fdd835' : 
                        luckyPoints.color === '白' ? '#eeeeee' : 
                        luckyPoints.color === '紫' ? '#8e24aa' : 
                        luckyPoints.color === '茶' ? '#8d6e63' : 
                        luckyPoints.color === '橙' ? '#fb8c00' : '#9e9e9e',
                border: '2px solid white',
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                mb: 1
              }} />
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {luckyPoints.color}
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: '1 1 200px', 
              p: 2, 
              border: `1px solid ${style.borderColor}30`,
              borderRadius: 2,
              bgcolor: `${style.secondaryColor}50`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                ラッキーアイテム
              </Typography>
              <Box sx={{ 
                fontSize: '2rem', 
                mb: 1,
                textShadow: '0 2px 5px rgba(0,0,0,0.15)'
              }}>
                🎁
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {luckyPoints.items.join('、')}
              </Typography>
            </Box>
            
            <Box sx={{ 
              flex: '1 1 200px', 
              p: 2, 
              border: `1px solid ${style.borderColor}30`,
              borderRadius: 2,
              bgcolor: `${style.secondaryColor}50`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                ラッキーナンバー
              </Typography>
              <Box sx={{ 
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: style.background,
                color: style.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 'bold',
                boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                mb: 1
              }}>
                {luckyPoints.number}
              </Box>
            </Box>
            
            <Box sx={{ 
              flex: '1 1 200px', 
              p: 2, 
              border: `1px solid ${style.borderColor}30`,
              borderRadius: 2,
              bgcolor: `${style.secondaryColor}50`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                開運アクション
              </Typography>
              <Box sx={{ 
                fontSize: '2rem', 
                mb: 1,
                textShadow: '0 2px 5px rgba(0,0,0,0.15)'
              }}>
                🚀
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 'medium', textAlign: 'center' }}>
                {luckyPoints.action}
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        {/* アドバイス */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2.5, 
            borderRadius: 2,
            borderTop: `4px solid ${style.borderColor}`,
            bgcolor: theme.palette.grey[50]
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            <Box component="span" sx={{ mr: 1, fontSize: '1.4rem' }}>💡</Box>
            詳細アドバイス
          </Typography>
          
          <Typography sx={{ lineHeight: 1.7 }}>
            {summaryAdvice || 
              `本日は「${dayElement}」のエネルギーが強まり、創造性と情熱が高まる日です。${dayElement}の持つ活動性と明るさを活かし、新しいプロジェクトの立ち上げや、チームでのブレインストーミングに最適な1日となるでしょう。`
            }
          </Typography>
        </Paper>

        {/* チームヒント */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 3, 
            mt: 3, 
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            borderLeft: `4px solid ${style.borderColor}`,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 12px 28px rgba(0,0,0,0.12)'
            }
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: 150,
              background: `linear-gradient(90deg, transparent, ${style.secondaryColor}40)`,
              zIndex: 0
            }}
          />

          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
              fontWeight: 600
            }}
          >
            <GroupsIcon sx={{ mr: 1.5, color: style.borderColor }} />
            チームヒント
          </Typography>
          
          <Typography sx={{ mb: 2, position: 'relative', zIndex: 1 }}>
            今日はチーム内の「{dayElement}」属性の同僚との相性が特に良好です。
            同じ{dayElement}タイプ同士で新しいアイデアを共有すると、さらに発展するでしょう。
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button 
              variant="outlined"
              startIcon={style.icon || <FireIcon />}
              size="small"
              sx={{ 
                borderRadius: '20px',
                bgcolor: style.secondaryColor,
                borderColor: style.borderColor,
                color: theme.palette.getContrastText(style.secondaryColor),
                '&:hover': {
                  bgcolor: style.secondaryColor,
                  borderColor: style.borderColor,
                  opacity: 0.9
                }
              }}
            >
              田中さん
            </Button>
            <Button 
              variant="outlined"
              startIcon={style.icon || <FireIcon />}
              size="small"
              sx={{ 
                borderRadius: '20px',
                bgcolor: style.secondaryColor,
                borderColor: style.borderColor,
                color: theme.palette.getContrastText(style.secondaryColor),
                '&:hover': {
                  bgcolor: style.secondaryColor,
                  borderColor: style.borderColor,
                  opacity: 0.9
                }
              }}
            >
              山田さん
            </Button>
          </Box>
        </Paper>
      </Box>
    </Card>
  );
};

export default FortuneDetail;