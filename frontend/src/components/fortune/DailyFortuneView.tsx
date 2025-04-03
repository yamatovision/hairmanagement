import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Box, Typography, Button, Paper, CircularProgress, Divider, Chip, Rating } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/date.utils';
import fortuneService from '../../services/fortune.service';

// 評価から日本語表現への変換
const ratingToJapanese = (rating: string): string => {
  const ratings: Record<string, string> = {
    excellent: '最高',
    good: '良好',
    neutral: '普通',
    caution: '注意',
    poor: '不調'
  };
  return ratings[rating] || '不明';
};

// 分野名から日本語表現への変換
const categoryToJapanese = (category: string): string => {
  const categories: Record<string, string> = {
    work: '仕事運',
    teamwork: 'チームワーク運',
    health: '健康運',
    communication: 'コミュニケーション運'
  };
  return categories[category] || category;
};

// 五行の色マッピング
const elementColors: Record<string, string> = {
  '木': '#4CAF50', // 緑
  '火': '#F44336', // 赤
  '土': '#FF9800', // オレンジ
  '金': '#FFD700', // 金色
  '水': '#2196F3'  // 青
};

// スコアをパーセンテージバーの幅に変換
const scoreToWidth = (score: number): string => {
  return `${Math.min(100, Math.max(0, score))}%`;
};

// 運勢カテゴリのスコアバー
const CategoryScoreBar: React.FC<{ category: string; score: number }> = ({ category, score }) => {
  return (
    <ScoreBarContainer>
      <ScoreLabel>
        {categoryToJapanese(category)}
        <ScoreValue>{score}/100</ScoreValue>
      </ScoreLabel>
      <ScoreBarOuter>
        <ScoreBarInner width={scoreToWidth(score)} />
      </ScoreBarOuter>
    </ScoreBarContainer>
  );
};

/**
 * デイリーフォーチュンコンポーネント
 * ユーザーの日次運勢を表示
 */
const DailyFortuneView: React.FC = () => {
  const [fortune, setFortune] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFortune = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 運勢データを取得
        const data = await fortuneService.getDailyFortune();
        setFortune(data);
      } catch (err) {
        console.error('運勢データの取得に失敗しました', err);
        setError('運勢データの取得に失敗しました。しばらく経ってから再度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    loadFortune();
  }, []);

  // 相談ボタンのクリックハンドラー
  const handleConsultClick = () => {
    navigate('/conversation/fortune');
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
        <Typography variant="body1" mt={2}>運勢を計算中...</Typography>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          再読み込み
        </Button>
      </ErrorContainer>
    );
  }

  if (!fortune) {
    return (
      <ErrorContainer>
        <Typography>運勢データが見つかりません。</Typography>
      </ErrorContainer>
    );
  }

  // 五行属性の色を取得
  const elementColor = elementColors[fortune.sajuData.mainElement] || '#757575';

  return (
    <FortuneContainer>
      <FortuneHeader>
        <FortuneDate>
          <Typography variant="h6" fontWeight="bold">
            {formatDate(fortune.date)} の運勢
          </Typography>
        </FortuneDate>
        <FortuneRating>
          <Rating 
            value={fortune.starRating}
            readOnly
            precision={0.5}
            size="large"
          />
          <Typography variant="subtitle1" ml={1}>
            {ratingToJapanese(fortune.rating)}
          </Typography>
        </FortuneRating>
      </FortuneHeader>

      <ElementalInfo>
        <ElementChip
          label={`${fortune.sajuData.mainElement}の${fortune.sajuData.yinYang}`}
          style={{ backgroundColor: elementColor, color: fortune.sajuData.mainElement === '金' ? '#000' : '#fff' }}
        />
        <CompatibilityScore>
          <Typography variant="body2">今日の相性: {fortune.sajuData.compatibility}/100</Typography>
        </CompatibilityScore>
      </ElementalInfo>

      <ScoreSection>
        <Typography variant="h6" gutterBottom>分野別運勢</Typography>
        <CategoryScoreBar category="work" score={fortune.categories.work} />
        <CategoryScoreBar category="teamwork" score={fortune.categories.teamwork} />
        <CategoryScoreBar category="health" score={fortune.categories.health} />
        <CategoryScoreBar category="communication" score={fortune.categories.communication} />
      </ScoreSection>

      <Divider sx={{ my: 2 }} />

      <AdviceSection>
        <Typography variant="h6" gutterBottom>今日のアドバイス</Typography>
        <AdviceText>
          {fortune.advice.split('\n\n').map((paragraph: string, index: number) => (
            <Typography 
              key={index} 
              variant="body1" 
              paragraph
              style={{ 
                whiteSpace: 'pre-line',
                marginBottom: paragraph.startsWith('•') ? '4px' : '16px'
              }}
            >
              {paragraph}
            </Typography>
          ))}
        </AdviceText>
      </AdviceSection>

      <ActionsSection>
        <ConsultButton
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleConsultClick}
        >
          詳しく相談する
        </ConsultButton>
      </ActionsSection>
    </FortuneContainer>
  );
};

// スタイル定義
const FortuneContainer = styled(Paper)({
  padding: 24,
  maxWidth: 800,
  margin: '0 auto',
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
});

const FortuneHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16
});

const FortuneDate = styled(Box)({
  display: 'flex',
  alignItems: 'center'
});

const FortuneRating = styled(Box)({
  display: 'flex',
  alignItems: 'center'
});

const ElementalInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 24
});

const ElementChip = styled(Chip)({
  fontWeight: 'bold',
  fontSize: '1rem',
  padding: '8px 0',
  height: 'auto'
});

const CompatibilityScore = styled(Box)({
  marginLeft: 16
});

const ScoreSection = styled(Box)({
  marginBottom: 24
});

const ScoreBarContainer = styled(Box)({
  marginBottom: 12
});

const ScoreLabel = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 4
});

const ScoreValue = styled(Typography)({
  fontWeight: 'bold'
});

const ScoreBarOuter = styled(Box)({
  width: '100%',
  height: 8,
  backgroundColor: '#e0e0e0',
  borderRadius: 4,
  overflow: 'hidden'
});

const ScoreBarInner = styled(Box)<{ width: string }>(({ width }) => ({
  height: '100%',
  width,
  backgroundColor: '#1976d2',
  borderRadius: 4
}));

const AdviceSection = styled(Box)({
  marginBottom: 24
});

const AdviceText = styled(Box)({
  backgroundColor: '#f5f5f5',
  padding: 16,
  borderRadius: 8,
  borderLeft: '4px solid #1976d2'
});

const ActionsSection = styled(Box)({
  marginTop: 16
});

const ConsultButton = styled(Button)({
  borderRadius: 8,
  padding: '12px 0',
  fontWeight: 'bold'
});

const LoadingContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 400
});

const ErrorContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 300,
  padding: 24,
  textAlign: 'center'
});

export default DailyFortuneView;