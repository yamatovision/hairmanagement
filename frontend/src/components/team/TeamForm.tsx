/**
 * チームフォームコンポーネント
 * 
 * チームの作成および編集に使用するフォーム
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
// カスタム ITeam 型定義（コンポーネント内で使用）
interface ITeam {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  members?: Array<{
    userId: string;
    role: string;
    joinedAt: string | Date;
  }>;
}

// プロパティ型定義
interface TeamFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (teamData: any) => Promise<void>;
  team?: ITeam | null;
  isLoading: boolean;
  error?: string | null;
}

/**
 * チーム作成・編集フォームコンポーネント
 */
const TeamForm: React.FC<TeamFormProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  team, 
  isLoading, 
  error 
}) => {
  // フォームの状態
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [nameError, setNameError] = useState('');
  
  // 編集モードかどうか
  const isEditMode = !!team;
  
  // チームデータが変更されたときにフォームを更新
  useEffect(() => {
    if (team) {
      setName(team.name || '');
      setDescription(team.description || '');
      setIsActive(team.isActive ?? true);
    } else {
      // 新規作成時は初期値にリセット
      setName('');
      setDescription('');
      setIsActive(true);
    }
    setNameError('');
  }, [team, open]);
  
  // バリデーション関数
  const validateForm = () => {
    let isValid = true;
    
    // チーム名のバリデーション
    if (!name.trim()) {
      setNameError('チーム名は必須です');
      isValid = false;
    } else if (name.length > 50) {
      setNameError('チーム名は50文字以内にしてください');
      isValid = false;
    } else {
      setNameError('');
    }
    
    return isValid;
  };
  
  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const teamData = {
      name,
      description,
      isActive
    };
    
    try {
      await onSubmit(teamData);
    } catch (error) {
      console.error('フォーム送信エラー:', error);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={isLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEditMode ? 'チーム設定の編集' : '新しいチームを作成'}
        </DialogTitle>
        
        <DialogContent>
          <Box mt={1} mb={3}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="チーム名"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              variant="outlined"
              error={!!nameError}
              helperText={nameError}
              disabled={isLoading}
            />
            
            <TextField
              label="チームの説明"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              variant="outlined"
              disabled={isLoading}
              placeholder="チームの目的や活動内容を入力してください"
            />
            
            {isEditMode && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  チームステータス
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      disabled={isLoading}
                      color="primary"
                    />
                  }
                  label={isActive ? "アクティブ" : "非アクティブ"}
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  非アクティブにすると、チームメンバーはこのチームにアクセスできなくなります。
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={onClose} 
            color="inherit" 
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
          >
            {isLoading ? '処理中...' : isEditMode ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamForm;