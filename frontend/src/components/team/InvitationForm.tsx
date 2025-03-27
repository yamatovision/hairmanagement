/**
 * 招待フォームコンポーネント
 * 
 * チームメンバーを招待するためのフォーム
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
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SendIcon from '@mui/icons-material/Send';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { IInvitation } from '../../utils/sharedTypes';

import { InvitationRole, InvitationStatus } from '../../types/models';

// カスタム ITeam 型定義（コンポーネント内で使用）
interface ITeam {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  ownerId?: string;
  admins?: string[];
  members?: Array<{
    userId: string;
    role: string;
    joinedAt: string | Date;
  }>;
}

// プロパティ型定義
interface InvitationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (invitationData: any) => Promise<void>;
  onCancelInvitation: (invitationId: string) => Promise<void>;
  onResendInvitation: (invitationId: string) => Promise<void>;
  team?: ITeam | null;
  invitations?: IInvitation[];
  isLoading: boolean;
  error?: string | null;
}

// 招待ステータスに応じたスタイルを返す関数
const getStatusStyle = (status: InvitationStatus) => {
  switch (status) {
    case 'pending':
      return { color: '#FF9800', icon: <PendingIcon />, text: '保留中' };
    case 'accepted':
      return { color: '#4CAF50', icon: <CheckCircleIcon />, text: '承諾済み' };
    case 'declined':
      return { color: '#F44336', icon: <CancelIcon />, text: '拒否' };
    case 'expired':
      return { color: '#9E9E9E', icon: <ScheduleIcon />, text: '期限切れ' };
    default:
      return { color: '#757575', icon: <ScheduleIcon />, text: '不明' };
  }
};

// 役割に応じたスタイルを返す関数
const getRoleStyle = (role: InvitationRole) => {
  switch (role) {
    case 'admin':
      return { color: '#2196F3', icon: <AdminPanelSettingsIcon />, text: '管理者' };
    case 'member':
      return { color: '#4CAF50', icon: <PersonIcon />, text: 'メンバー' };
    default:
      return { color: '#757575', icon: <PersonIcon />, text: 'メンバー' };
  }
};

/**
 * チームメンバー招待フォームコンポーネント
 */
const InvitationForm: React.FC<InvitationFormProps> = ({
  open,
  onClose,
  onSubmit,
  onCancelInvitation,
  onResendInvitation,
  team,
  invitations = [],
  isLoading,
  error
}) => {
  // フォームの状態
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InvitationRole>('member');
  const [emailError, setEmailError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyInviteId, setCopyInviteId] = useState<string | null>(null);
  
  // フォームをリセット
  useEffect(() => {
    if (open) {
      setEmail('');
      setRole('member');
      setEmailError('');
    }
  }, [open]);
  
  // メールアドレスのバリデーションを行う関数
  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };
  
  // バリデーション関数
  const validateForm = () => {
    let isValid = true;
    
    // メールアドレスのバリデーション
    if (!email.trim()) {
      setEmailError('メールアドレスは必須です');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('有効なメールアドレスを入力してください');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    return isValid;
  };
  
  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !team) {
      return;
    }
    
    const invitationData = {
      email,
      teamId: team.id,
      role
    };
    
    try {
      await onSubmit(invitationData);
      // 成功したらフォームをリセット
      setEmail('');
    } catch (error) {
      console.error('招待送信エラー:', error);
    }
  };
  
  // 招待URLをクリップボードにコピー
  const handleCopyInviteUrl = (invitationUrl: string, invitationId: string) => {
    navigator.clipboard.writeText(invitationUrl).then(() => {
      setCopySuccess(true);
      setCopyInviteId(invitationId);
      setTimeout(() => {
        setCopySuccess(false);
        setCopyInviteId(null);
      }, 2000);
    });
  };
  
  // 現在の保留中の招待
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  
  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle>
        {team?.name ? `「${team.name}」にメンバーを招待` : 'チームにメンバーを招待'}
      </DialogTitle>
      
      <DialogContent>
        <Box mb={3}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Box display="flex" alignItems="flex-start" flexWrap="wrap">
              <TextField
                label="メールアドレス"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                variant="outlined"
                error={!!emailError}
                helperText={emailError}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, mr: { xs: 0, sm: 2 }, minWidth: { xs: '100%', sm: 'auto' } }}
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2, minWidth: { xs: '100%', sm: 'auto' } }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">役割</FormLabel>
                  <RadioGroup
                    row
                    value={role}
                    onChange={(e) => setRole(e.target.value as InvitationRole)}
                  >
                    <FormControlLabel
                      value="admin"
                      control={<Radio color="primary" />}
                      label="管理者"
                      disabled={isLoading}
                    />
                    <FormControlLabel
                      value="member"
                      control={<Radio color="primary" />}
                      label="メンバー"
                      disabled={isLoading}
                    />
                    <FormControlLabel
                      value="member"
                      control={<Radio color="primary" />}
                      label="メンバー"
                      disabled={isLoading}
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
              
              <Box sx={{ mt: 2, ml: { xs: 0, sm: 'auto' } }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                >
                  招待を送信
                </Button>
              </Box>
            </Box>
          </form>
          
          {/* 招待プレビュー */}
          <Box mt={4} mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              招待メールプレビュー
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: '#f5f5f5', 
                border: '1px solid #ddd',
                borderRadius: 1
              }}
            >
              <Typography variant="body2" component="div">
                <Box fontWeight="bold" mb={1}>
                  件名: {team?.name ? `「${team.name}」への招待` : 'チームへの招待'}
                </Box>
                <Box mb={1}>
                  こんにちは、
                </Box>
                <Box mb={1}>
                  あなたは{team?.name ? `「${team.name}」` : 'チーム'}に{
                    role === 'admin' ? '管理者' : 'メンバー'
                  }として招待されました。
                </Box>
                <Box mb={1}>
                  招待を承諾するには、下記のリンクをクリックしてください。
                </Box>
                <Box 
                  mb={1} 
                  sx={{ 
                    p: 1, 
                    bgcolor: '#e3f2fd', 
                    borderRadius: 1, 
                    border: '1px solid #bbdefb'
                  }}
                >
                  https://example.com/invitation/[招待トークン]
                </Box>
                <Box>
                  この招待は7日間有効です。
                </Box>
              </Typography>
            </Paper>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {/* 保留中の招待リスト */}
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              保留中の招待
              {pendingInvitations.length > 0 && (
                <Chip 
                  label={pendingInvitations.length} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }} 
                />
              )}
            </Typography>
            
            {pendingInvitations.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                保留中の招待はありません。
              </Typography>
            ) : (
              <List>
                {pendingInvitations.map((invitation) => {
                  const statusStyle = getStatusStyle(invitation.status);
                  const roleStyle = getRoleStyle(invitation.role);
                  const isCopied = copySuccess && copyInviteId === invitation.id;
                  
                  // 招待の有効期限を確認
                  const expiresAt = new Date(invitation.expiresAt);
                  const now = new Date();
                  const isExpiring = expiresAt.getTime() - now.getTime() < 86400000; // 24時間以内
                  
                  // 有効期限の表示用フォーマット
                  const expiresAtFormatted = expiresAt.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  
                  // サンプルの招待URL（実際には招待オブジェクトから取得）
                  const invitationUrl = `https://example.com/invitation/${invitation.invitationToken}`;
                  
                  return (
                    <ListItem
                      key={invitation.id}
                      sx={{
                        mb: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        transition: '0.3s',
                        '&:hover': {
                          bgcolor: '#f9f9f9'
                        }
                      }}
                    >
                      <ListItemIcon>
                        {roleStyle.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={invitation.email}
                        secondary={
                          <>
                            <Box component="span" sx={{ display: 'block', mb: 0.5 }}>
                              <Chip
                                label={roleStyle.text}
                                size="small"
                                sx={{
                                  bgcolor: `${roleStyle.color}20`,
                                  color: roleStyle.color,
                                  mr: 1
                                }}
                              />
                              <Chip
                                label={statusStyle.text}
                                size="small"
                                sx={{
                                  bgcolor: `${statusStyle.color}20`,
                                  color: statusStyle.color
                                }}
                              />
                            </Box>
                            <Typography variant="caption" component="span" sx={{ 
                              display: 'block',
                              color: isExpiring ? 'error.main' : 'text.secondary'
                            }}>
                              有効期限: {expiresAtFormatted}
                              {isExpiring && ' (まもなく期限切れ)'}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title={isCopied ? "コピーしました！" : "招待URLをコピー"}>
                          <IconButton
                            edge="end"
                            aria-label="招待URLをコピー"
                            onClick={() => handleCopyInviteUrl(invitationUrl, invitation.id)}
                            color={isCopied ? "primary" : "default"}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="招待を再送信">
                          <IconButton
                            edge="end"
                            aria-label="招待を再送信"
                            onClick={() => onResendInvitation(invitation.id)}
                            color="primary"
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="招待をキャンセル">
                          <IconButton
                            edge="end"
                            aria-label="招待をキャンセル"
                            onClick={() => onCancelInvitation(invitation.id)}
                            color="error"
                            size="small"
                          >
                            <HighlightOffIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitationForm;