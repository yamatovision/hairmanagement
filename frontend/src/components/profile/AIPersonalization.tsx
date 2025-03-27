import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  FormControlLabel,
  Switch,
  Slider,
  Button,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  RadioGroup,
  Radio,
  FormLabel,
  SelectChangeEvent,
  Grid,
  styled,
  Tooltip,
} from '@mui/material';
import { useUser } from '../../contexts/UserContext';

// カラーオプションのスタイル
const ColorOption = styled('div')<{ color: string; selected: boolean }>(({ color, selected }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: color,
  cursor: 'pointer',
  position: 'relative',
  border: selected ? '2px solid #000' : 'none',
  '&:hover': {
    opacity: 0.8,
  },
  '&::after': selected
    ? {
        content: '"✓"',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#fff',
        fontSize: 20,
        textShadow: '0 0 2px rgba(0, 0, 0, 0.5)',
      }
    : {},
}));

// AIパーソナライゼーションコンポーネント
const AIPersonalization: React.FC = () => {
  // 状態
  const [aiTone, setAiTone] = useState<string>('スタンダード（標準）');
  const [conversationDepth, setConversationDepth] = useState<number>(3);
  const [supportAreas, setSupportAreas] = useState({
    technicalSkills: true,
    communication: true,
    career: true,
    mentalHealth: false,
  });
  const [colorTheme, setColorTheme] = useState<string>('#9c27b0'); // デフォルトは紫
  const [textSize, setTextSize] = useState<string>('標準');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [reduceAnimations, setReduceAnimations] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // カラーテーマのオプション
  const colorOptions = [
    { color: '#9c27b0', name: 'パープル' }, // 紫
    { color: '#2196F3', name: 'ブルー' },   // 青
    { color: '#4CAF50', name: 'グリーン' }, // 緑
    { color: '#F44336', name: 'レッド' },   // 赤
    { color: '#FF9800', name: 'オレンジ' }, // オレンジ
    { color: '#795548', name: 'ブラウン' }  // 茶
  ];

  // AIトーン変更ハンドラー
  const handleAiToneChange = (event: SelectChangeEvent) => {
    setAiTone(event.target.value);
  };

  // テキストサイズ変更ハンドラー
  const handleTextSizeChange = (event: SelectChangeEvent) => {
    setTextSize(event.target.value);
  };

  // サポート領域変更ハンドラー
  const handleSupportAreaChange = (area: keyof typeof supportAreas) => {
    setSupportAreas({
      ...supportAreas,
      [area]: !supportAreas[area],
    });
  };

  // 対話の深さ変更ハンドラー
  const handleDepthChange = (_: Event, newValue: number | number[]) => {
    setConversationDepth(newValue as number);
  };

  // カラーテーマ変更ハンドラー
  const handleColorChange = (color: string) => {
    setColorTheme(color);
  };

  // ダークモード切替ハンドラー
  const handleDarkModeChange = () => {
    setIsDarkMode(!isDarkMode);
  };

  // アニメーション削減切替ハンドラー
  const handleReduceAnimationsChange = () => {
    setReduceAnimations(!reduceAnimations);
  };

  // 送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 実際のAPIコールはここで行う
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 仮のディレイ
      setSuccess(true);
    } catch (err) {
      setError('設定の更新に失敗しました。後でもう一度お試しください。');
      console.error('パーソナライズ設定更新エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  // 対話の深さラベルの生成
  const getDepthLabel = (value: number) => {
    switch (value) {
      case 1:
        return '簡潔';
      case 3:
        return '標準';
      case 5:
        return '深掘り';
      default:
        return `${value}`;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="subtitle1" gutterBottom>
        AIパーソナライズ設定
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        AIアシスタントの話し方や特性をカスタマイズできます。
      </Typography>

      <Box mt={3}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="ai-tone-label">AIの話し方</InputLabel>
          <Select
            labelId="ai-tone-label"
            id="ai-tone"
            value={aiTone}
            label="AIの話し方"
            onChange={handleAiToneChange}
          >
            <MenuItem value="フォーマル（丁寧）">フォーマル（丁寧）</MenuItem>
            <MenuItem value="スタンダード（標準）">スタンダード（標準）</MenuItem>
            <MenuItem value="カジュアル（親しみやすい）">カジュアル（親しみやすい）</MenuItem>
            <MenuItem value="コーチング風（励まし）">コーチング風（励まし）</MenuItem>
            <MenuItem value="占い師風（神秘的）">占い師風（神秘的）</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="subtitle2" gutterBottom>
          AIのサポート領域
        </Typography>
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={supportAreas.technicalSkills}
                onChange={() => handleSupportAreaChange('technicalSkills')}
                color="primary"
              />
            }
            label="技術スキル向上"
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 1 }}>
            美容技術の向上に関するアドバイスを提供します。
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={supportAreas.communication}
                onChange={() => handleSupportAreaChange('communication')}
                color="primary"
              />
            }
            label="接客・コミュニケーション"
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 1 }}>
            お客様とのコミュニケーションスキル向上をサポートします。
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={supportAreas.career}
                onChange={() => handleSupportAreaChange('career')}
                color="primary"
              />
            }
            label="キャリア発展"
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 1 }}>
            美容師としてのキャリアパス構築をサポートします。
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={supportAreas.mentalHealth}
                onChange={() => handleSupportAreaChange('mentalHealth')}
                color="primary"
              />
            }
            label="メンタルヘルス"
          />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 1 }}>
            ストレス管理や心のケアに関するアドバイスを提供します。
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography id="depth-slider" gutterBottom>
            対話の深さ
          </Typography>
          <Slider
            value={conversationDepth}
            onChange={handleDepthChange}
            aria-labelledby="depth-slider"
            step={1}
            marks={[
              { value: 1, label: '簡潔' },
              { value: 3, label: '標準' },
              { value: 5, label: '深掘り' },
            ]}
            min={1}
            max={5}
            valueLabelDisplay="auto"
            valueLabelFormat={getDepthLabel}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            AIの回答の詳細度を調整します。深掘りに設定すると、より詳細な回答が得られます。
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box mt={3}>
        <Typography variant="subtitle1" gutterBottom>
          表示カスタマイズ
        </Typography>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          カラーテーマ
        </Typography>
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {colorOptions.map((option) => (
            <Grid item key={option.color}>
              <Tooltip title={option.name} placement="top">
                <ColorOption
                  color={option.color}
                  selected={colorTheme === option.color}
                  onClick={() => handleColorChange(option.color)}
                />
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="text-size-label">文字サイズ</InputLabel>
          <Select
            labelId="text-size-label"
            id="text-size"
            value={textSize}
            label="文字サイズ"
            onChange={handleTextSizeChange}
          >
            <MenuItem value="小">小</MenuItem>
            <MenuItem value="標準">標準</MenuItem>
            <MenuItem value="大">大</MenuItem>
            <MenuItem value="特大">特大</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch checked={isDarkMode} onChange={handleDarkModeChange} color="primary" />
          }
          label="ダークモード"
          sx={{ display: 'block', mb: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={reduceAnimations}
              onChange={handleReduceAnimationsChange}
              color="primary"
            />
          }
          label="視覚エフェクトを削減"
          sx={{ display: 'block', mb: 2 }}
        />
        <Typography variant="body2" color="textSecondary">
          アニメーションやエフェクトを減らし、シンプルな表示にします。
        </Typography>
      </Box>

      <Box mt={4} display="flex" justifyContent="center">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? '更新中...' : '設定を保存'}
        </Button>
      </Box>

      {/* 成功/エラーメッセージ */}
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          AIパーソナライズ設定が正常に更新されました。
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AIPersonalization;