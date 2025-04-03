/**
 * ユーザー追加フォームコンポーネント
 * 
 * 新しいユーザーを追加するためのフォーム
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  FormHelperText,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { IUser } from '../../../types';
import userService from '../../../services/user.service';
import { authService } from '../../../services/auth.service';

// 役割オプション
const roleOptions = [
  { value: 'employee', label: '従業員' },
  { value: 'manager', label: 'マネージャー' },
  { value: 'admin', label: '管理者' },
  { value: 'custom', label: 'カスタム役割' }
];

// サブスクリプションプランオプション
const planOptions = [
  { value: 'standard', label: 'スタンダード' },
  { value: 'premium', label: 'プレミアム' }
];

interface UserAddFormProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: (user: IUser) => void;
}

/**
 * ユーザー追加フォームコンポーネント
 */
const UserAddForm: React.FC<UserAddFormProps> = ({ open, onClose, onUserAdded }) => {
  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    birthDate: '',
    birthHour: '',
    birthLocation: '',
    customRole: '',
    subscriptionPlan: 'standard'
  });
  
  // 入力エラー状態
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // 送信状態
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // パスワード表示/非表示
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // フォーム入力変更ハンドラ
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | 
    { target: { name?: string; value: unknown } }
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 入力時にエラーをクリア
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // パスワード表示切替ハンドラ
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 確認パスワード表示切替ハンドラ
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // フォーム検証
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // 名前検証
    if (!formData.name.trim()) {
      errors.name = '名前は必須です';
    }
    
    // メールアドレス検証
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    // パスワード検証
    if (!formData.password) {
      errors.password = 'パスワードは必須です';
    } else if (formData.password.length < 8) {
      errors.password = 'パスワードは8文字以上必要です';
    }
    
    // パスワード確認検証
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }
    
    // 生年月日検証（入力がある場合のみ）
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (isNaN(birthDate.getTime())) {
        errors.birthDate = '有効な日付を入力してください';
      } else if (birthDate > today) {
        errors.birthDate = '未来の日付は指定できません';
      }
    }
    
    // 生まれた時間検証（入力がある場合のみ）
    if (formData.birthHour) {
      const hour = parseInt(formData.birthHour, 10);
      if (isNaN(hour) || hour < 0 || hour > 23) {
        errors.birthHour = '0〜23の時間を入力してください';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // フォーム検証
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // ユーザー登録
      // UserRegistrationRequestの型に合わせて整形
      const userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'employee' | 'manager' | 'admin' | 'custom',
        subscriptionPlan: formData.subscriptionPlan
      };
      
      // カスタム役割の場合、customRoleを追加
      if (formData.role === 'custom' && formData.customRole) {
        userData.customRole = formData.customRole;
      }
      
      // オプションフィールドを追加
      if (formData.birthDate) userData.birthDate = formData.birthDate;
      if (formData.birthLocation) userData.birthLocation = formData.birthLocation;
      if (formData.birthHour) userData.birthHour = parseInt(formData.birthHour, 10);
      
      const response = await authService.registerUser(userData);
      
      // 成功時
      setLoading(false);
      
      // 親コンポーネントに通知
      if (response) {
        onUserAdded(response);
      }
      
      // フォームをリセット
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
        birthDate: '',
        birthHour: '',
        birthLocation: '',
        customRole: '',
        subscriptionPlan: 'standard'
      });
      
      // ダイアログを閉じる
      onClose();
      
    } catch (err: any) {
      console.error('ユーザー登録エラー:', err);
      setError(err.message || 'ユーザーの登録に失敗しました');
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">ユーザーを追加</Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* 必須情報セクション */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">
                基本情報（必須）
              </Typography>
            </Grid>
            
            {/* 名前 */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="名前"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                disabled={loading}
              />
            </Grid>
            
            {/* メールアドレス */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="メールアドレス"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
                disabled={loading}
              />
            </Grid>
            
            {/* パスワード */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="password"
                label="パスワード"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.password}
                helperText={formErrors.password || 'パスワードは8文字以上必要です'}
                required
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            {/* パスワード確認 */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="confirmPassword"
                label="パスワード確認"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword || 'パスワードを再入力してください'}
                required
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            {/* 役割 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel id="role-label">役割</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="役割"
                >
                  {roleOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* カスタム役割 - roleがcustomの場合のみ表示 */}
            {formData.role === 'custom' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="customRole"
                  label="カスタム役割名"
                  value={formData.customRole}
                  onChange={handleChange}
                  fullWidth
                  disabled={loading}
                  placeholder="例: プロジェクトリーダー"
                  required={formData.role === 'custom'}
                />
              </Grid>
            )}
            
            {/* サブスクリプションプラン */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel id="subscription-plan-label">サブスクリプションプラン</InputLabel>
                <Select
                  labelId="subscription-plan-label"
                  name="subscriptionPlan"
                  value={formData.subscriptionPlan}
                  onChange={handleChange}
                  label="サブスクリプションプラン"
                >
                  {planOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  ユーザーに割り当てるサブスクリプションプラン
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* 四柱推命情報セクション */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                四柱推命情報（任意）
              </Typography>
              <Typography variant="body2" color="text.secondary">
                四柱推命計算に必要な情報です。後からプロフィール設定で追加することもできます。
              </Typography>
            </Grid>
            
            {/* 生年月日 */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="birthDate"
                label="生年月日"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.birthDate}
                helperText={formErrors.birthDate}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* 生まれた時間 */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="birthHour"
                label="生まれた時間（0-23時）"
                type="number"
                value={formData.birthHour}
                onChange={handleChange}
                fullWidth
                error={!!formErrors.birthHour}
                helperText={formErrors.birthHour}
                disabled={loading}
                inputProps={{ min: 0, max: 23 }}
              />
            </Grid>
            
            {/* 出生地 */}
            <Grid item xs={12}>
              <TextField
                name="birthLocation"
                label="出生地"
                value={formData.birthLocation}
                onChange={handleChange}
                fullWidth
                disabled={loading}
                placeholder="例: 東京都新宿区"
              />
              <FormHelperText>
                四柱推命の計算に使用される経度・緯度情報に変換されます。
              </FormHelperText>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={onClose}
            color="inherit"
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? '保存中...' : 'ユーザー作成'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserAddForm;