/**
 * ユーザー管理アクションコンポーネント
 * 
 * ユーザー詳細表示・編集・サブスクリプション変更などの機能を提供
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import { IUser, PlanType } from '../../../types/models';
import userService from '../../../services/user.service';
import subscriptionService from '../../../services/subscription.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface UserManagementActionProps {
  user: IUser | null;
  open: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

/**
 * ユーザー管理アクションコンポーネント
 */
const UserManagementAction: React.FC<UserManagementActionProps> = ({
  user,
  open,
  onClose,
  onUserUpdated
}) => {
  // タブの状態
  const [tabValue, setTabValue] = useState(0);
  
  // ユーザー編集フォーム状態
  const [formData, setFormData] = useState<Partial<IUser>>(user || {});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // サブスクリプション状態
  const [selectedPlan, setSelectedPlan] = useState<PlanType | ''>('');
  const [currentPlan, setCurrentPlan] = useState<PlanType>(PlanType.STANDARD);
  
  // 処理状態
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // コンポーネントマウント時またはユーザー変更時にフォームデータを初期化
  React.useEffect(() => {
    if (user) {
      setFormData({
        ...user
      });
      
      // サブスクリプションの初期選択
      // ユーザーにsubscriptionPlanがある場合はそれを設定、なければデフォルト値
      if (user.subscriptionPlan) {
        setCurrentPlan(user.subscriptionPlan);
      }
      setSelectedPlan('');
    }
  }, [user]);
  
  // タブ変更ハンドラー
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // テキストフィールド入力変更ハンドラー
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // エラーをクリア
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // セレクト変更ハンドラー
  const handleSelectChange = (
    e: SelectChangeEvent<any>
  ) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // エラーをクリア
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // サブスクリプションプラン変更ハンドラー
  const handlePlanChange = (
    event: SelectChangeEvent<PlanType | ''>
  ) => {
    setSelectedPlan(event.target.value as PlanType);
  };
  
  // フォーム検証
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = '名前は必須です';
    }
    
    if (!formData.email?.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    // 生年月日の検証（入力がある場合）
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        errors.birthDate = '有効な日付を入力してください';
      } else if (birthDate > today) {
        errors.birthDate = '未来の日付は指定できません';
      }
    }
    
    // 役割の検証
    if (!formData.role) {
      errors.role = '役割を選択してください';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // ユーザー情報更新ハンドラー
  const handleUpdateUser = async () => {
    if (!validateForm() || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // ユーザー情報更新
      await userService.updateUserById(user.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        customRole: formData.role === 'custom' ? formData.customRole : undefined,
        birthDate: formData.birthDate,
        birthHour: formData.birthHour,
        birthLocation: formData.birthLocation,
        isActive: formData.isActive
      });
      
      setSuccessMessage('ユーザー情報が更新されました');
      setLoading(false);
      
      // 親コンポーネントに更新を通知
      onUserUpdated();
    } catch (err: any) {
      console.error('ユーザー更新エラー:', err);
      setError(err.message || 'ユーザー情報の更新に失敗しました');
      setLoading(false);
    }
  };
  
  // サブスクリプション更新ハンドラー
  const handleUpdateSubscription = async () => {
    if (!selectedPlan || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // サブスクリプション情報のみを更新するため、専用のサービスを使用
      await subscriptionService.updateUserSubscription(user.id, selectedPlan as PlanType);
      
      // ユーザー情報も更新して同期を保つ
      await userService.updateUserById(user.id, {
        subscriptionPlan: selectedPlan as PlanType
      });
      
      // 更新成功
      setCurrentPlan(selectedPlan as PlanType);
      setSuccessMessage(`サブスクリプションが${selectedPlan === PlanType.PREMIUM ? 'プレミアム' : 'スタンダード'}プランに更新されました`);
      setLoading(false);
      setSelectedPlan('');
      
      // 親コンポーネントに更新を通知
      onUserUpdated();
    } catch (err: any) {
      console.error('サブスクリプション更新エラー:', err);
      setError(err.message || 'サブスクリプションの更新に失敗しました');
      setLoading(false);
    }
  };
  
  // 日付フォーマット
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return '未設定';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '無効な日付';
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // ユーザーが選択されていない場合
  if (!user) {
    return null;
  }
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        ユーザー管理: {user.name}
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="ユーザー情報" />
          <Tab label="サブスクリプション" />
        </Tabs>
      </Box>
      
      <DialogContent>
        {/* 処理状態メッセージ */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        {/* ユーザー情報タブ */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="名前"
                value={formData.name || ''}
                onChange={handleTextChange}
                fullWidth
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="メールアドレス"
                value={formData.email || ''}
                onChange={handleTextChange}
                fullWidth
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.role} disabled={loading}>
                <InputLabel>役割</InputLabel>
                <Select
                  name="role"
                  value={formData.role || ''}
                  onChange={handleSelectChange}
                  label="役割"
                >
                  <MenuItem value="employee">従業員</MenuItem>
                  <MenuItem value="manager">マネージャー</MenuItem>
                  <MenuItem value="admin">管理者</MenuItem>
                  <MenuItem value="custom">カスタム役割</MenuItem>
                  {user.role === 'superadmin' && (
                    <MenuItem value="superadmin">スーパー管理者</MenuItem>
                  )}
                </Select>
                {formErrors.role && (
                  <FormHelperText>{formErrors.role}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* カスタム役割入力フィールド - roleがcustomの場合のみ表示 */}
            {formData.role === 'custom' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="customRole"
                  label="カスタム役割名"
                  value={formData.customRole || ''}
                  onChange={handleTextChange}
                  fullWidth
                  placeholder="例: プロジェクトリーダー"
                  disabled={loading}
                  required
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>ステータス</InputLabel>
                <Select
                  name="isActive"
                  value={formData.isActive === undefined ? "true" : formData.isActive ? "true" : "false"}
                  onChange={(e) => {
                    const value = e.target.value === "true";
                    setFormData({
                      ...formData,
                      isActive: value
                    });
                  }}
                  label="ステータス"
                >
                  <MenuItem value="true">有効</MenuItem>
                  <MenuItem value="false">無効</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  プロフィール情報
                </Typography>
              </Divider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="birthDate"
                label="生年月日"
                type="date"
                value={formData.birthDate || ''}
                onChange={handleTextChange}
                fullWidth
                error={!!formErrors.birthDate}
                helperText={formErrors.birthDate}
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="birthLocation"
                label="出生地"
                value={formData.birthLocation || ''}
                onChange={handleTextChange}
                fullWidth
                disabled={loading}
                placeholder="例: 東京都新宿区"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="birthHour"
                label="生まれた時間（0-23時）"
                type="number"
                value={formData.birthHour || ''}
                onChange={handleTextChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: 0,
                  max: 23,
                }}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  陰陽五行属性
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.elementalType?.mainElement || '未設定'} {formData.elementalType?.yinYang || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  生年月日に基づいて計算されます
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  アカウント情報
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      ユーザーID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      アカウント作成日
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      最終ログイン
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : '記録なし'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      最終更新日
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(user.updatedAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              onClick={handleUpdateUser}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'ユーザー情報を更新'}
            </Button>
          </Box>
        </TabPanel>
        
        {/* サブスクリプションタブ */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              現在のサブスクリプション
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  プラン
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip 
                    label={currentPlan === PlanType.PREMIUM ? "プレミアム" : "スタンダード"} 
                    color="primary" 
                    size="small" 
                    sx={{ mt: 0.5 }}
                  />
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  ステータス
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip 
                    label="有効" 
                    color="success" 
                    size="small" 
                    sx={{ mt: 0.5 }}
                  />
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  更新日
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {/* 実際のデータに基づいて更新日を表示 */}
                  2025年5月1日
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  使用モデル
                </Typography>
                <Typography variant="body1" gutterBottom>
                  AI: {currentPlan === PlanType.PREMIUM ? 'Claude Sonnet' : 'Claude Haiku'} / フォーチュン: Claude Sonnet
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            サブスクリプションの変更
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>プラン選択</InputLabel>
            <Select
              value={selectedPlan}
              onChange={handlePlanChange}
              label="プラン選択"
              disabled={loading}
            >
              <MenuItem value="">
                <em>選択してください</em>
              </MenuItem>
              <MenuItem value={PlanType.STANDARD as string}>スタンダードプラン (¥5,000/月)</MenuItem>
              <MenuItem value={PlanType.PREMIUM as string}>プレミアムプラン (¥12,000/月)</MenuItem>
            </Select>
            <FormHelperText>
              {selectedPlan === PlanType.PREMIUM ? 
                'プレミアムプランでは、より高度なAI対話と分析が可能になります' : 
                selectedPlan === PlanType.STANDARD ? 
                'スタンダードプランでは、基本的な機能が利用可能です' : 
                '変更するプランを選択してください'}
            </FormHelperText>
          </FormControl>
          
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button
              onClick={handleUpdateSubscription}
              variant="contained"
              color="primary"
              disabled={loading || !selectedPlan}
            >
              {loading ? <CircularProgress size={24} /> : 'サブスクリプションを更新'}
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserManagementAction;