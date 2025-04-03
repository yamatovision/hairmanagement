/**
 * デイリーフォーチュンコンポーネント
 * モックアップに基づく新実装（ジョナサン・アイブデザイン）
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Chip,
  LinearProgress,
  useTheme,
  Skeleton,
  Divider,
  Paper
} from '@mui/material';
import { 
  Psychology as PsychologyIcon,
  LocalFireDepartment as FireIcon,
  Pets as WoodIcon,
  Terrain as EarthIcon,
  Euro as MetalIcon,
  Water as WaterIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  Visibility as VisibilityIcon,
  ExpandMore as _ExpandMoreIcon,  // 未使用
  ExpandLess as _ExpandLessIcon,  // 未使用
  TipsAndUpdates as TipsIcon
} from '@mui/icons-material';
import { marked } from 'marked';

// 型定義は型チェックのために参照しているため明示的にインポート
import type { IFortune as _IFortune } from '../../types/models'; // 未使用
import { useFortune } from '../../hooks/useFortune';

interface DailyFortuneProps {
  onClickViewDetail: () => void;
}

/**
 * 五行属性の色と背景色マッピング
 */
const elementStyles = {
  '木': {
    icon: <WoodIcon />,
    color: '#43a047',
    bgColor: '#e8f5e9',
    gradient: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
    textColor: '#fff'
  },
  '火': {
    icon: <FireIcon />,
    color: '#e53935',
    bgColor: '#ffebee',
    gradient: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
    textColor: '#fff'
  },
  '土': {
    icon: <EarthIcon />,
    color: '#ff8f00',
    bgColor: '#fff8e1',
    gradient: 'linear-gradient(135deg, #ff8f00 0%, #ef6c00 100%)',
    textColor: '#fff'
  },
  '金': {
    icon: <MetalIcon />,
    color: '#fdd835',
    bgColor: '#fffde7',
    gradient: 'linear-gradient(135deg, #fdd835 0%, #f9a825 100%)',
    textColor: '#212121'
  },
  '水': {
    icon: <WaterIcon />,
    color: '#1e88e5',
    bgColor: '#e3f2fd',
    gradient: 'linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)',
    textColor: '#fff'
  }
};

/**
 * 運勢レベルに応じたテキスト
 */
const getLuckLevelText = (score: number): string => {
  if (score >= 80) return '絶好調';
  if (score >= 60) return '好調';
  if (score >= 40) return '普通';
  if (score >= 20) return '要注意';
  return '厳しい';
};

const DailyFortune: React.FC<DailyFortuneProps> = ({ onClickViewDetail: _onClickViewDetail }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { dailyFortune, loading, error, fetchDailyFortune } = useFortune();
  const [expanded, setExpanded] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scoreAnimated, setScoreAnimated] = useState(false);

  // プログレスバーのアニメーション
  useEffect(() => {
    if (dailyFortune && !scoreAnimated) {
      setTimeout(() => {
        setScoreAnimated(true);
      }, 500);
    }
  }, [dailyFortune, scoreAnimated]);

  // 詳細表示の開閉を切り替え
  const _toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // 運勢を更新
  const handleRefresh = async () => {
    setRefreshing(true);
    setScoreAnimated(false);
    try {
      await fetchDailyFortune();
    } catch (error) {
      console.error('運勢更新エラー:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 読み込み中の表示
  if (loading && !dailyFortune) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
        <Skeleton variant="rectangular" height={150} />
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
      <Card elevation={3} sx={{ mb: 3, borderRadius: 3, bgcolor: '#fff4e5', borderLeft: '4px solid #ff9800' }}>
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
      <Card elevation={3} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" align="center">
            今日の運勢はまだ取得されていません
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleRefresh}
            >
              運勢を取得
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 運勢データを解析
  const {
    // デフォルト値を設定
    sajuData = { mainElement: '火', yinYang: '陽', compatibility: 50 },
    overallScore = 70,
    // ESLint警告: categories は定義されていますが使用されていません
    // ページデザインが変更された場合に備えて残しておきます
    // categories = {
    //   work: 62,      // キャリア運
    //   teamwork: 76,   // 人間関係運
    //   health: 70,     // 健康運
    //   communication: 72  // 創造力運
    // },
    advice = "本日は「火」のエネルギーが強まり、創造性と情熱が高まる日です。火の持つ活動性と明るさを活かし、新しいプロジェクトの立ち上げや、チームでのブレインストーミングに最適な1日となるでしょう。",
    aiGeneratedAdvice,
    personalGoal = "最高のAISAASを作る",
    teamGoal = "年内30億円規模でバイアウト"
  } = dailyFortune;
  
  // 新形式のアドバイス（aiGeneratedAdvice.advice）があれば、それを使用
  const todayAdvice = aiGeneratedAdvice?.advice || advice;
  
  // 五行要素の取得
  const mainElement = sajuData.mainElement || '火';
  const elementStyle = elementStyles[mainElement as keyof typeof elementStyles] || elementStyles['火'];

  // ラッキーポイント用のデフォルト値
  const defaultLuckyPoints = {
    color: "赤",
    items: ["鈴", "明るい色の文房具"],
    number: 8,
    action: "朝日を浴びる"
  };

  // 日付フォーマット
  const today = new Date();
  const formattedDate = today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });

  // 注: 相性スコアと五行バランス補完スコアの分割計算は削除されました

  return (
    <Card 
      elevation={3} 
      sx={{ 
        mb: 3, 
        borderRadius: 3, 
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 16px 32px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* カードヘッダー */}
      <Box sx={{ 
        p: 3.5, 
        background: elementStyle.gradient,
        color: elementStyle.textColor,
        position: 'relative',
        boxShadow: `0 4px 15px ${elementStyle.color}40`
      }}>
        {/* 背景アイコン */}
        <Box sx={{ 
          position: 'absolute',
          right: '-10px',
          top: '-30px',
          fontSize: '180px',
          opacity: 0.08,
          transform: 'rotate(15deg)',
          color: 'white'
        }}>
          {elementStyle.icon}
        </Box>

        <Typography variant="body1" sx={{ opacity: 0.9, mb: 1, fontWeight: 500, letterSpacing: '0.02em' }}>
          {formattedDate}
        </Typography>
        
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, position: 'relative', zIndex: 2 }}>
          今日の運勢
        </Typography>
        
        <Chip
          icon={elementStyle.icon}
          label={`${mainElement}の${sajuData.yinYang} (${sajuData.dayMaster}${sajuData.earthBranch || '午'})`}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            fontWeight: 500,
            padding: '8px',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        />
      </Box>

      {/* スコアチャートセクション */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        p: 4, 
        backgroundColor: elementStyle.bgColor,
        borderBottom: `1px solid ${elementStyle.color}20`
      }}>
        <Box sx={{ 
          width: 200, 
          height: 200, 
          position: 'relative',
          filter: `drop-shadow(0 8px 16px ${elementStyle.color}40)`
        }}>
          {/* 円形のプログレスバー（実装はシンプルに） */}
          <Box sx={{ 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            background: `conic-gradient(
              ${elementStyle.color} ${overallScore}%, 
              ${theme.palette.grey[200]} ${overallScore}% 100%
            )`,
            transform: 'rotate(-90deg)'
          }} />

          {/* 中央テキスト */}
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            textAlign: 'center',
            backgroundColor: 'white',
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Typography sx={{ 
              fontSize: '3rem', 
              fontWeight: 700, 
              color: elementStyle.color,
              lineHeight: 1
            }}>
              {overallScore}
            </Typography>
            <Typography sx={{ 
              fontSize: '1rem', 
              color: theme.palette.grey[800],
              marginTop: 0.5
            }}>
              {getLuckLevelText(overallScore)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 更新中インジケーター */}
      {refreshing && <LinearProgress />}
      
      {/* カードコンテンツ */}
      <CardContent sx={{ p: 3.5 }}>
        {/* 今日のポイント */}
        <Typography 
          variant="h6" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            fontWeight: 600,
            color: theme.palette.primary.main
          }}
        >
          <TipsIcon sx={{ mr: 1.5, color: elementStyle.color }} />
          今日のポイント
        </Typography>

        <Typography sx={{ lineHeight: 1.7, fontSize: '1.05rem', mb: 3 }}>
          {typeof todayAdvice === 'string' && todayAdvice.length > 0 ? 
            // JSONオブジェクトの文字列なら適切に処理
            (todayAdvice.startsWith('{') && todayAdvice.endsWith('}') ? 
              "本日は五行のエネルギーを活かして行動しましょう。" : 
              // マークダウン形式のテキスト（#が含まれている）ならHTMLタグを除去
              todayAdvice.includes('#') ? 
                todayAdvice.split('\n')[0].replace(/#.*?今日のあなたの運気\s*/, '') : 
                todayAdvice
            ) : 
            "本日の運勢アドバイスを準備中です。"
          }
        </Typography>
        
        {/* ラッキーポイント - 常に表示（API応答またはデフォルト値を使用） */}
        <Box sx={{ 
          backgroundColor: elementStyle.bgColor, 
          borderRadius: 2, 
          p: 3, 
          mb: 3,
          boxShadow: `0 6px 16px ${elementStyle.color}30`,
          border: `1px solid ${elementStyle.color}20`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 背景装飾 */}
          <Box 
            component="span" 
            sx={{ 
              position: 'absolute',
              right: '-20px',
              top: '-20px',
              fontSize: '120px',
              opacity: 0.05,
              transform: 'rotate(15deg)',
              pointerEvents: 'none'
            }}
          >
            ✨
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '1.1rem', 
              color: elementStyle.color, 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 'bold'
            }}
          >
            <Box component="span" sx={{ mr: 1.5, fontSize: '1.2rem' }}>✨</Box>
            今日のラッキーポイント
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 2, 
            mb: 2 
          }}>
            {/* ラッキーカラー */}
            <Box sx={{ 
              bgcolor: 'white', 
              p: 1.5, 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="caption" color="text.secondary" mb={1}>
                ラッキーカラー
              </Typography>
              <Box sx={{ 
                width: 30, 
                height: 30,
                borderRadius: '50%',
                mb: 1,
                bgcolor: 
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === '赤') ? '#e53935' : 
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === '青') ? '#1e88e5' : 
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === '緑') ? '#43a047' : 
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === '黄') ? '#fdd835' : 
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === '白') ? '#eeeeee' : 
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === '紫') ? '#8e24aa' : 
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === '茶') ? '#8d6e63' :
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === 'オレンジ') ? '#fb8c00' :
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === 'ピンク') ? '#ec407a' :
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === '金') ? '#ffd54f' :
                  ((aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color) === '銀') ? '#e0e0e0' :
                  '#9e9e9e',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }} />
              <Typography variant="body2" fontWeight="medium">
                {aiGeneratedAdvice?.luckyPoints?.color || defaultLuckyPoints.color}
              </Typography>
            </Box>
            
            {/* ラッキーアイテム */}
            <Box sx={{ 
              bgcolor: 'white', 
              p: 1.5, 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="caption" color="text.secondary" mb={1}>
                ラッキーアイテム
              </Typography>
              <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>🎁</Box>
              <Typography variant="body2" fontWeight="medium" textAlign="center">
                {/* 配列が空の場合はデフォルト値を使用するよう修正 */}
                {aiGeneratedAdvice?.luckyPoints?.items?.[0] || defaultLuckyPoints.items[0]}
              </Typography>
            </Box>
            
            {/* ラッキーナンバー */}
            <Box sx={{ 
              bgcolor: 'white', 
              p: 1.5, 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="caption" color="text.secondary" mb={1}>
                ラッキーナンバー
              </Typography>
              <Box sx={{ 
                width: 30, 
                height: 30,
                borderRadius: '50%',
                bgcolor: elementStyle.color,
                color: elementStyle.textColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                mb: 0.5,
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }}>
                {aiGeneratedAdvice?.luckyPoints?.number || defaultLuckyPoints.number}
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {aiGeneratedAdvice?.luckyPoints?.number || defaultLuckyPoints.number}
              </Typography>
            </Box>
          </Box>
          
          {/* 開運アクション */}
          <Box sx={{ 
            bgcolor: 'white', 
            p: 2, 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ fontSize: '1.5rem' }}>🚀</Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                開運アクション
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {aiGeneratedAdvice?.luckyPoints?.action || defaultLuckyPoints.action}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 総合運気スコアのバーは表示されたまま */}

        {/* マークダウンコンテンツの表示 */}
        {aiGeneratedAdvice?.advice && (
          <Box sx={{ mt: 2, mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                display: 'flex', 
                alignItems: 'center',
                color: theme.palette.primary.main, // 紫色に統一
                fontSize: '1.2rem'
              }}
            >
              <VisibilityIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
              詳細アドバイス
            </Typography>
            
            <Box 
              component="div"
              sx={{ 
                p: 2, 
                bgcolor: `${theme.palette.primary.main}08`, // 薄い紫色の背景
                borderRadius: 2,
                border: `1px solid ${theme.palette.primary.light}20`,
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                '& h1': {
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  mt: 2,
                  mb: 1,
                  pb: 0.5,
                  borderBottom: `1px solid ${theme.palette.primary.light}30`
                },
                '& h2': {
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: theme.palette.primary.dark,
                  mt: 2,
                  mb: 1
                },
                '& p': {
                  mb: 1.5,
                  lineHeight: 1.7
                },
                '& ul': {
                  mb: 1.5,
                  pl: 2
                },
                '& li': {
                  mb: 0.5
                }
              }}
              // マークダウンをHTMLに変換して挿入
              dangerouslySetInnerHTML={{ __html: marked.parse(aiGeneratedAdvice.advice).toString() }}
            />
          </Box>
        )}

        <Divider sx={{ 
          my: 3, 
          background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1) 15%, rgba(0,0,0,0.1) 85%, transparent)'
        }} />

        {/* 拡張可能なコンテンツ */}
        {expanded && (
          <>
            {/* 目標へのアドバイス - 詳細アドバイスに統合したため削除 */}

            {/* AIアシスタントへの相談ボタン */}
            <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<PsychologyIcon />}
                onClick={() => navigate('/fortune-chat')}
                aria-label="運勢情報をもとにAIアシスタントに相談する"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 10%, ${theme.palette.primary.dark} 90%)`,
                  padding: '12px 24px',
                  borderRadius: '30px',
                  boxShadow: '0 4px 16px rgba(106, 27, 154, 0.25)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(106, 27, 154, 0.35)'
                  }
                }}
              >
                運勢をAIアシスタントに相談
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                今日の五行エネルギーをどう活かすか、AIがパーソナライズされたアドバイスを提供します
              </Typography>
            </Box>
          </>
        )}

        {/* フッタースペース */}
        <Box sx={{ height: 10 }} />
      </CardContent>
    </Card>
  );
};

export default DailyFortune;