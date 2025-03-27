import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Slider,
  Button,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { useUser } from '../../contexts/UserContext';

// import { NotificationSettingsType } from '../../shared/types';
// TypeScript型は直接定義して使用
type NotificationSettingsType = {
  dailyFortune: boolean;
  promptQuestions: boolean;
  teamEvents: boolean;
  goalReminders: boolean;
  systemUpdates: boolean;
};

// 通知設定コンポーネントのProps
interface NotificationSettingsProps {
  notificationSettings?: NotificationSettingsType;
}

// デフォルトの通知設定
const defaultSettings: NotificationSettingsType = {
  dailyFortune: true,
  promptQuestions: true,
  teamEvents: true,
  goalReminders: true,
  systemUpdates: false,
};

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ notificationSettings }) => {
  const { updateNotificationSettings } = useUser();
  const [settings, setSettings] = useState<NotificationSettingsType>(
    notificationSettings || defaultSettings
  );
  const [frequency, setFrequency] = useState<number>(3);
  const [dataRetention, setDataRetention] = useState<string>('3ヶ月');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 通知設定変更ハンドラー
  const handleSettingChange = (setting: keyof NotificationSettingsType) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  // 通知頻度変更ハンドラー
  const handleFrequencyChange = (_: Event, newValue: number | number[]) => {
    setFrequency(newValue as number);
  };

  // データ保持期間変更ハンドラー
  const handleDataRetentionChange = (event: SelectChangeEvent<string>) => {
    setDataRetention(event.target.value);
  };

  // 送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateNotificationSettings(settings);
      setSuccess(true);
    } catch (err) {
      setError('通知設定の更新に失敗しました。後でもう一度お試しください。');
      console.error('通知設定更新エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  // 頻度ラベルの生成
  const getFrequencyLabel = (value: number) => {
    switch (value) {
      case 1:
        return '少なめ';
      case 3:
        return '標準';
      case 5:
        return '多め';
      default:
        return `${value}`;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="subtitle1" gutterBottom>
        通知設定
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        どのような通知を受け取るか設定できます。
      </Typography>

      <Box mt={3}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.dailyFortune}
              onChange={() => handleSettingChange('dailyFortune')}
              color="primary"
            />
          }
          label="デイリー運勢の通知"
        />
        <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
          その日の運勢が更新されたときに通知を受け取ります。
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={settings.teamEvents}
              onChange={() => handleSettingChange('teamEvents')}
              color="primary"
            />
          }
          label="チーム相性のアラート"
        />
        <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
          チームメンバーとの相性が特に良い日や注意が必要な日に通知を受け取ります。
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={settings.promptQuestions}
              onChange={() => handleSettingChange('promptQuestions')}
              color="primary"
            />
          }
          label="AI対話のリマインダー"
        />
        <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
          定期的な対話のきっかけとなる質問を提案します。
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={settings.goalReminders}
              onChange={() => handleSettingChange('goalReminders')}
              color="primary"
            />
          }
          label="メンター活動の通知"
        />
        <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
          メンターシップ活動に関連する通知を受け取ります。
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={settings.systemUpdates}
              onChange={() => handleSettingChange('systemUpdates')}
              color="primary"
            />
          }
          label="システム更新通知"
        />
        <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
          新機能や重要なシステム更新に関する通知を受け取ります。
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box mt={3}>
        <Typography id="frequency-slider" gutterBottom>
          通知頻度
        </Typography>
        <Slider
          value={frequency}
          onChange={handleFrequencyChange}
          aria-labelledby="frequency-slider"
          step={1}
          marks={[
            { value: 1, label: '少なめ' },
            { value: 3, label: '標準' },
            { value: 5, label: '多め' },
          ]}
          min={1}
          max={5}
          valueLabelDisplay="auto"
          valueLabelFormat={getFrequencyLabel}
        />
      </Box>

      <Box mt={4}>
        <FormControl fullWidth>
          <InputLabel id="data-retention-label">対話履歴の保持期間</InputLabel>
          <Select
            labelId="data-retention-label"
            id="data-retention"
            value={dataRetention}
            label="対話履歴の保持期間"
            onChange={handleDataRetentionChange}
          >
            <MenuItem value="1週間">1週間</MenuItem>
            <MenuItem value="1ヶ月">1ヶ月</MenuItem>
            <MenuItem value="3ヶ月">3ヶ月</MenuItem>
            <MenuItem value="6ヶ月">6ヶ月</MenuItem>
            <MenuItem value="1年">1年</MenuItem>
            <MenuItem value="無期限">無期限</MenuItem>
          </Select>
        </FormControl>
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
          {loading ? '更新中...' : '通知設定を保存'}
        </Button>
      </Box>

      {/* 成功/エラーメッセージ */}
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          通知設定が正常に更新されました。
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

export default NotificationSettings;