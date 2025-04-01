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
  styled,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { PhotoCamera, Delete, Info } from '@mui/icons-material';
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

// 四柱情報の型定義
type Pillar = {
  stem?: string;
  branch?: string;
  fullStemBranch?: string;
};

type SajuProfile = {
  fourPillars?: {
    yearPillar?: Pillar;
    monthPillar?: Pillar;
    dayPillar?: Pillar;
    hourPillar?: Pillar;
  };
  mainElement?: string;
  secondaryElement?: string;
  yinYang?: string;
  twelveFortunes?: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
  };
  hiddenStems?: {
    year?: string[];
    month?: string[];
    day?: string[];
    hour?: string[];
  };
};

type IUser = {
  id: string;
  email: string;
  name: string;
  birthDate: string;
  birthHour?: number;
  birthLocation?: string;
  role: 'employee' | 'manager' | 'admin' | 'superadmin';
  profilePicture?: string;
  elementalType?: ElementalType;
  sajuProfile?: SajuProfile;
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
  const { updateProfile, user: contextUser } = useUser();
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    position: user.role || '',
    birthDate: user.birthDate || '',
    birthHour: user.birthHour || null,
    birthLocation: user.birthLocation || '',
    profilePicture: user.profilePicture || '',
  });
  const [elementalType, setElementalType] = useState<ElementalType>(
    user.elementalType || { mainElement: '木', yinYang: '陽' }
  );
  const [timeUnknown, setTimeUnknown] = useState(!user.birthHour);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ユーザー情報が更新されたら、フォームデータも更新する
  useEffect(() => {
    if (contextUser) {
      setFormData({
        name: contextUser.name || '',
        email: contextUser.email || '',
        position: contextUser.role || '',
        birthDate: contextUser.birthDate || '',
        birthHour: contextUser.birthHour || null,
        birthLocation: contextUser.birthLocation || '',
        profilePicture: contextUser.profilePicture || '',
      });
      
      setTimeUnknown(!contextUser.birthHour);
      
      // elementalTypeかelementalProfileどちらかがあれば使用
      if (contextUser.elementalType) {
        setElementalType(contextUser.elementalType);
        console.log('UseEffect: contextUser.elementalType から更新', contextUser.elementalType);
      } else if (contextUser.elementalProfile) {
        setElementalType(contextUser.elementalProfile);
        console.log('UseEffect: contextUser.elementalProfile から更新', contextUser.elementalProfile);
      } else if (contextUser.sajuProfile && contextUser.sajuProfile.mainElement && contextUser.sajuProfile.yinYang) {
        setElementalType({
          mainElement: contextUser.sajuProfile.mainElement as ElementType,
          secondaryElement: contextUser.sajuProfile.secondaryElement as ElementType,
          yinYang: contextUser.sajuProfile.yinYang as YinYangType
        });
        console.log('UseEffect: contextUser.sajuProfile から更新', contextUser.sajuProfile);
      }
    }
  }, [contextUser]);

  // フォームの入力変更ハンドラー
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // 生年月日が変更された場合、陰陽五行属性を自動計算
    if (name === 'birthDate' && value) {
      try {
        const birthDate = new Date(value);
        
        // 簡易的な計算ロジック（バックエンドの実装に合わせて近似）
        const year = birthDate.getFullYear();
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        
        // 主属性の計算（年と月の合計を5で割った余り）
        const elements: ElementType[] = ['木', '火', '土', '金', '水'];
        const mainElementIndex = (year + month) % 5;
        const mainElement = elements[mainElementIndex];
        
        // 副属性の計算（月と日の合計を5で割った余り）
        const secondaryElementIndex = (month + day) % 5;
        const secondaryElement = elements[secondaryElementIndex];
        
        // 陰陽の計算（年が奇数なら陽、偶数なら陰）
        const yinYang: YinYangType = year % 2 !== 0 ? '陽' : '陰';
        
        // 新しい五行属性をセット（主要素と副要素が同じでもOK）
        setElementalType({
          mainElement,
          secondaryElement,
          yinYang
        });
        
        console.log('生年月日から陰陽五行属性を自動計算:', {
          birthDate: value,
          mainElement,
          secondaryElement,
          yinYang
        });
      } catch (err) {
        console.error('生年月日からの五行属性計算エラー:', err);
      }
    }
  };
  
  // 時間選択のハンドラー
  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const hours = value ? parseInt(value, 10) : null;
    
    if (hours !== null && (hours < 0 || hours > 23)) {
      return; // 0-23の範囲外なら処理しない
    }
    
    setFormData({
      ...formData,
      birthHour: hours
    });
    setTimeUnknown(false);
  };
  
  // 時間不明チェックボックスのハンドラー
  const handleTimeUnknownChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setTimeUnknown(checked);
    if (checked) {
      setFormData({
        ...formData,
        birthHour: null
      });
    }
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
  
  // 陰陽の変更ハンドラー
  const handleYinYangChange = (_: React.MouseEvent<HTMLElement>, newYinYang: '陰' | '陽') => {
    if (newYinYang) {
      setElementalType({
        ...elementalType,
        yinYang: newYinYang,
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

    // デバッグ情報
    console.log('送信データ:', {
      name: formData.name,
      birthDate: formData.birthDate,
      birthHour: formData.birthHour,
      birthLocation: formData.birthLocation,
      elementalType,
      profilePicture: formData.profilePicture,
      role: formData.position
    });

    try {
      // APIの仕様に合わせて送信データを準備
      // バックエンドがelementalProfileを期待しているため、elementalTypeをelementalProfileとしても送信
      const updateData = {
        name: formData.name,
        birthDate: formData.birthDate,
        birthHour: timeUnknown ? null : formData.birthHour,
        birthLocation: formData.birthLocation,
        elementalType: elementalType,
        elementalProfile: elementalType, // バックエンド互換性のために追加
        profilePicture: formData.profilePicture,
        role: formData.position as 'employee' | 'manager' | 'admin',
      };
      
      console.log('API送信データ:', updateData);
      
      const updatedUser = await updateProfile(updateData);
      console.log('更新後のユーザー情報:', updatedUser);
      
      // 更新後のデータで表示を更新
      if (updatedUser) {
        setFormData({
          ...formData,
          name: updatedUser.name || formData.name,
          email: updatedUser.email || formData.email,
          position: updatedUser.role || formData.position,
          birthDate: updatedUser.birthDate || formData.birthDate,
          birthHour: updatedUser.birthHour !== undefined ? updatedUser.birthHour : formData.birthHour,
          birthLocation: updatedUser.birthLocation || formData.birthLocation,
          profilePicture: updatedUser.profilePicture || formData.profilePicture,
        });
        
        if (updatedUser.elementalType) {
          setElementalType(updatedUser.elementalType);
        }
        
        setTimeUnknown(!updatedUser.birthHour);
      }
      
      setSuccess(true);
      console.log('プロフィール更新成功');
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
        
        {/* 出生時間セクション */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              出生時間
              <Tooltip title="四柱推命の正確な算出には出生時間が必要です。不明な場合はチェックボックスをオンにしてください。">
                <IconButton size="small">
                  <Info fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={timeUnknown}
                  onChange={handleTimeUnknownChange}
                  name="timeUnknown"
                />
              }
              label="出生時間は不明"
            />
            
            {!timeUnknown && (
              <TextField
                fullWidth
                label="出生時間（24時間形式）"
                name="birthHour"
                type="number"
                value={formData.birthHour || ''}
                onChange={handleTimeChange}
                variant="outlined"
                inputProps={{ min: 0, max: 23 }}
                placeholder="0-23"
                helperText="0から23までの数値を入力してください"
              />
            )}
          </Box>
        </Grid>
        
        {/* 出生地セクション */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="出生地"
            name="birthLocation"
            value={formData.birthLocation}
            onChange={handleChange}
            variant="outlined"
            placeholder="例：東京都新宿区"
            helperText="都市名まで入力するとより正確な結果が得られます"
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="subtitle1" gutterBottom>
          陰陽五行属性
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            ※生年月日と生まれた時間から自動計算されます。陰陽五行属性は手動で変更することもできます。
            四柱推命の詳細情報は「四柱推命」タブをご覧ください。
            {elementalType && (
              <span style={{ display: 'block', marginTop: '4px' }}>
                現在の設定: 主属性「{elementalType.mainElement}」
                {elementalType.secondaryElement && `/ 副属性「${elementalType.secondaryElement}」`} 
                / {elementalType.yinYang}
              </span>
            )}
            <span style={{ display: 'block', marginTop: '4px', color: '#666' }}>
              （注：主要素と副要素は同じでも問題ありません。同じ要素の強化という考え方もあります）
            </span>
          </Typography>
          
          {/* 五行要素選択 */}
          <Box>
            <Typography variant="body2" mb={1}>五行要素:</Typography>
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
          
          {/* 陰陽選択 */}
          <Box>
            <Typography variant="body2" mb={1}>陰陽:</Typography>
            <ToggleButtonGroup
              value={elementalType.yinYang}
              exclusive
              onChange={handleYinYangChange}
              aria-label="陰陽"
            >
              <ToggleButton 
                value="陰" 
                sx={{ 
                  borderRadius: '20px',
                  padding: '8px 16px',
                  margin: '4px',
                  backgroundColor: (theme) => 
                    elementalType.yinYang === '陰' ? '#333333' : 'transparent',
                  color: (theme) => 
                    elementalType.yinYang === '陰' ? 'white' : 'inherit',
                  '&:hover': {
                    backgroundColor: (theme) => 
                      elementalType.yinYang === '陰' ? '#333333' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                陰
              </ToggleButton>
              <ToggleButton 
                value="陽" 
                sx={{ 
                  borderRadius: '20px',
                  padding: '8px 16px',
                  margin: '4px',
                  backgroundColor: (theme) => 
                    elementalType.yinYang === '陽' ? '#f5f5f5' : 'transparent',
                  color: (theme) => 
                    elementalType.yinYang === '陽' ? 'black' : 'inherit',
                  '&:hover': {
                    backgroundColor: (theme) => 
                      elementalType.yinYang === '陽' ? '#f5f5f5' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                陽
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
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