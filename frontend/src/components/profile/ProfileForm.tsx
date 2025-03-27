import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  styled
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { useUser } from '../../contexts/UserContext';

// import { IUser, ElementalType } from '../../shared/types';
// TypeScript型は直接定義して使用
type ElementType = '木' | '火' | '土' | '金' | '水';
type YinYangType = '陰' | '陽';
type ElementalType = {
  mainElement: ElementType;
  secondaryElement?: ElementType;
  yinYang: YinYangType;
};
type IUser = {
  id: string;
  email: string;
  name: string;
  birthDate: string;
  role: 'employee' | 'manager' | 'admin' | 'superadmin';
  profilePicture?: string;
  elementalType?: ElementalType;
  isActive: boolean;
};

// 五行属性のカラー定義
const elementColors = {
  '木': '#4CAF50', // 緑
  '火': '#F44336', // 赤
  '土': '#FFC107', // 黄
  '金': '#9E9E9E', // 灰色
  '水': '#2196F3', // 青
};

// 五行属性ボタンのカスタムスタイル
const ElementButton = styled(ToggleButton)(({ theme, value }) => ({
  borderRadius: '20px',
  padding: '8px 16px',
  margin: '4px',
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
  '&.Mui-selected': {
    backgroundColor: elementColors[value as keyof typeof elementColors],
    color: '#fff',
    '&:hover': {
      backgroundColor: elementColors[value as keyof typeof elementColors],
      opacity: 0.9,
    },
  },
}));

// ElementIcon for displaying the element color
const ElementIcon = styled(Box)<{ bgcolor: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => props.bgcolor};
`;

// プロフィールフォームコンポーネントのProps
interface ProfileFormProps {
  user: IUser;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const { updateProfile } = useUser();
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    position: user.role || '',
    birthDate: user.birthDate || '',
    profilePicture: user.profilePicture || '',
  });
  const [elementalType, setElementalType] = useState<ElementalType>(
    user.elementalType || { mainElement: '木', yinYang: '陽' }
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フォームの入力変更ハンドラー
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 五行属性の変更ハンドラー
  const handleElementChange = (_: React.MouseEvent<HTMLElement>, newElement: '木' | '火' | '土' | '金' | '水') => {
    if (newElement) {
      setElementalType({
        ...elementalType,
        mainElement: newElement,
      });
    }
  };

  // プロフィール画像のアップロードハンドラー
  const handleImageUpload = () => {
    // 実際のアプリケーションでは、ここで画像のアップロード処理を行う
    // 今回はモックアップなので、ランダムな画像URLを設定
    const randomId = Math.floor(Math.random() * 100);
    const randomGender = Math.random() > 0.5 ? 'women' : 'men';
    setFormData({
      ...formData,
      profilePicture: `https://randomuser.me/api/portraits/${randomGender}/${randomId}.jpg`,
    });
  };

  // プロフィール画像の削除ハンドラー
  const handleImageDelete = () => {
    setFormData({
      ...formData,
      profilePicture: '',
    });
  };

  // 送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateProfile({
        name: formData.name,
        birthDate: formData.birthDate,
        elementalType: elementalType,
        profilePicture: formData.profilePicture,
        role: formData.position as 'employee' | 'manager' | 'admin',
      });
      setSuccess(true);
    } catch (err) {
      setError('プロフィールの更新に失敗しました。後でもう一度お試しください。');
      console.error('プロフィール更新エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* プロフィール画像セクション */}
      <Box display="flex" alignItems="center" mb={4}>
        <Avatar
          src={formData.profilePicture}
          alt={formData.name}
          sx={{ width: 80, height: 80, mr: 3 }}
        />
        <Box>
          <Typography variant="body1" gutterBottom>
            プロフィール画像
          </Typography>
          <Box display="flex">
            <Button
              variant="contained"
              startIcon={<PhotoCamera />}
              onClick={handleImageUpload}
              sx={{ mr: 1 }}
            >
              画像を変更
            </Button>
            <IconButton
              color="error"
              onClick={handleImageDelete}
              disabled={!formData.profilePicture}
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 基本情報フォーム */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="お名前"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="メールアドレス"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            variant="outlined"
            disabled  // メールアドレスは変更不可
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="役職"
            name="position"
            value={formData.position}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="生年月日"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            required
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="subtitle1" gutterBottom>
          陰陽五行属性
        </Typography>
        <Box display="flex" flexDirection="column">
          <Typography variant="body2" color="textSecondary" gutterBottom>
            ※生年月日から自動計算されます。手動で変更することもできます。
          </Typography>
          <ToggleButtonGroup
            value={elementalType.mainElement}
            exclusive
            onChange={handleElementChange}
            aria-label="五行属性"
          >
            <ElementButton value="木">
              <ElementIcon bgcolor={elementColors['木']} />
              <span>木</span>
            </ElementButton>
            <ElementButton value="火">
              <ElementIcon bgcolor={elementColors['火']} />
              <span>火</span>
            </ElementButton>
            <ElementButton value="土">
              <ElementIcon bgcolor={elementColors['土']} />
              <span>土</span>
            </ElementButton>
            <ElementButton value="金">
              <ElementIcon bgcolor={elementColors['金']} />
              <span>金</span>
            </ElementButton>
            <ElementButton value="水">
              <ElementIcon bgcolor={elementColors['水']} />
              <span>水</span>
            </ElementButton>
          </ToggleButtonGroup>
        </Box>
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
          プロフィールが正常に更新されました。
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

export default ProfileForm;