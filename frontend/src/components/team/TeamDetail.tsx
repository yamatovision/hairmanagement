/**
 * チーム詳細コンポーネント
 * 
 * チーム詳細情報とメンバー管理を表示するコンポーネント
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Chip,
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import ForumIcon from '@mui/icons-material/Forum';
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

// 演習用のテストデータ
interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  element?: string;
  avatar?: string;
  joinedAt: string;
}

// プロパティ型定義
interface TeamDetailProps {
  team: ITeam | null;
  isLoading: boolean;
  error?: string | null;
  userRole: string;
  currentUserId: string;
  onInviteMembers: () => void;
  onEditTeam: () => void;
  onRemoveMember: (userId: string) => Promise<void>;
  onChangeRole: (userId: string, newRole: string) => Promise<void>;
}

// 役割に応じた色と表示名を返す関数
const getRoleInfo = (role: string) => {
  switch (role) {
    case 'owner':
      return { color: '#8C54FF', icon: <AdminPanelSettingsIcon />, label: 'オーナー' };
    case 'admin':
      return { color: '#2196F3', icon: <AdminPanelSettingsIcon />, label: '管理者' };
    case 'manager':
      return { color: '#9C27B0', icon: <SupervisorAccountIcon />, label: 'マネージャー' };
    case 'member':
      return { color: '#4CAF50', icon: <PersonIcon />, label: 'メンバー' };
    default:
      return { color: '#757575', icon: <PersonIcon />, label: 'メンバー' };
  }
};

// 五行属性に応じた色を返す関数
const getElementColor = (element?: string) => {
  switch (element) {
    case '木':
      return '#4CAF50';
    case '火':
      return '#F44336';
    case '土':
      return '#FFC107';
    case '金':
      return '#BDBDBD';
    case '水':
      return '#2196F3';
    default:
      return '#9E9E9E';
  }
};

/**
 * チーム詳細コンポーネント
 */
const TeamDetail: React.FC<TeamDetailProps> = ({
  team,
  isLoading,
  error,
  userRole,
  currentUserId,
  onInviteMembers,
  onEditTeam,
  onRemoveMember,
  onChangeRole
}) => {
  // タブの状態
  const [currentTab, setCurrentTab] = useState(0);
  
  // メンバーメニューの状態
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // 削除確認ダイアログの状態
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  
  // テスト用メンバーデータ
  const [members, setMembers] = useState<Member[]>([
    {
      id: 'owner-id',
      name: 'オーナー太郎',
      email: 'owner@example.com',
      role: 'owner',
      element: '火',
      joinedAt: '2025-01-15'
    },
    {
      id: 'admin-id',
      name: '管理者花子',
      email: 'admin@example.com',
      role: 'admin',
      element: '水',
      joinedAt: '2025-01-20'
    },
    {
      id: 'manager-id',
      name: 'マネージャー二郎',
      email: 'manager@example.com',
      role: 'manager',
      element: '木',
      joinedAt: '2025-02-01'
    },
    {
      id: 'member1-id',
      name: 'メンバー一郎',
      email: 'member1@example.com',
      role: 'member',
      element: '土',
      joinedAt: '2025-02-10'
    },
    {
      id: 'member2-id',
      name: 'メンバー二子',
      email: 'member2@example.com',
      role: 'member',
      element: '金',
      joinedAt: '2025-02-15'
    }
  ]);
  
  // タブ変更ハンドラ
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  // メンバーメニューを開く
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, member: Member) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };
  
  // メンバーメニューを閉じる
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  
  // メンバー削除確認ダイアログを開く
  const handleOpenRemoveDialog = () => {
    setMenuAnchorEl(null);
    setRemoveDialogOpen(true);
  };
  
  // メンバー削除確認ダイアログを閉じる
  const handleCloseRemoveDialog = () => {
    setRemoveDialogOpen(false);
  };
  
  // メンバー削除を実行
  const handleRemoveMember = async () => {
    if (selectedMember) {
      try {
        await onRemoveMember(selectedMember.id);
        // UIからメンバーを削除（実際には再取得するが、デモ用）
        setMembers(members.filter(m => m.id !== selectedMember.id));
      } catch (error) {
        console.error('メンバー削除エラー:', error);
      }
    }
    setRemoveDialogOpen(false);
  };
  
  // メンバーの役割を変更
  const handleChangeRole = async (newRole: string) => {
    if (selectedMember) {
      try {
        await onChangeRole(selectedMember.id, newRole);
        // UIでメンバーの役割を更新（実際には再取得するが、デモ用）
        setMembers(members.map(m => {
          if (m.id === selectedMember.id) {
            return { ...m, role: newRole as 'owner' | 'admin' | 'manager' | 'member' };
          }
          return m;
        }));
      } catch (error) {
        console.error('役割変更エラー:', error);
      }
    }
    setMenuAnchorEl(null);
  };
  
  // 権限チェック
  const isSuperAdmin = userRole === 'superadmin';
  const isOwner = team?.ownerId === currentUserId;
  const isAdmin = isOwner || isSuperAdmin || (team?.admins || []).includes(currentUserId);
  
  // ユーザーのイニシャルを取得する関数
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  // ロード中表示
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  // チームがnullの場合
  if (!team) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        チームが見つかりません。
      </Alert>
    );
  }
  
  return (
    <Box>
      {/* ヘッダー部分 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
          <Box>
            <Typography variant="h5" gutterBottom>
              {team.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {team.description || 'チームの説明はありません'}
            </Typography>
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
              <Chip
                icon={<GroupIcon fontSize="small" />}
                label={`${members.length}人のメンバー`}
                size="small"
                variant="outlined"
              />
              {!team.isActive && (
                <Chip
                  label="非アクティブ"
                  size="small"
                  color="error"
                />
              )}
            </Box>
          </Box>
          
          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            {isAdmin && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={onInviteMembers}
                  sx={{ mr: 1 }}
                >
                  メンバー招待
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={onEditTeam}
                >
                  設定
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* タブ部分 */}
      <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="メンバー" icon={<GroupIcon />} iconPosition="start" />
          <Tab label="パフォーマンス" icon={<BarChartIcon />} iconPosition="start" />
          <Tab label="ディスカッション" icon={<ForumIcon />} iconPosition="start" />
        </Tabs>
        
        {/* メンバータブ */}
        {currentTab === 0 && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              チームメンバー
            </Typography>
            
            <Grid container spacing={2}>
              {members.map((member) => {
                const roleInfo = getRoleInfo(member.role);
                const isCurrentUser = member.id === currentUserId;
                const canManage = (isAdmin || isSuperAdmin) && !isCurrentUser && member.role !== 'owner';
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={member.id}>
                    <Card 
                      elevation={1} 
                      sx={{ 
                        position: 'relative',
                        transition: '0.3s',
                        '&:hover': {
                          boxShadow: 3,
                        }
                      }}
                    >
                      {member.role === 'owner' && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            right: 0,
                            width: 0,
                            height: 0,
                            borderStyle: 'solid',
                            borderWidth: '0 24px 24px 0',
                            borderColor: `transparent ${roleInfo.color} transparent transparent`,
                            zIndex: 1
                          }} 
                        />
                      )}
                      
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box display="flex" alignItems="center">
                            <Avatar 
                              src={member.avatar} 
                              sx={{ 
                                bgcolor: member.element ? getElementColor(member.element) : roleInfo.color,
                                color: 'white',
                                mr: 2
                              }}
                            >
                              {getInitials(member.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {member.name}
                                {isCurrentUser && (
                                  <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                    (あなた)
                                  </Typography>
                                )}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" noWrap>
                                {member.email}
                              </Typography>
                              <Box display="flex" alignItems="center" mt={0.5} flexWrap="wrap" gap={0.5}>
                                <Chip
                                  label={roleInfo.label}
                                  size="small"
                                  sx={{
                                    bgcolor: `${roleInfo.color}20`,
                                    color: roleInfo.color,
                                    fontWeight: 'medium',
                                    fontSize: '0.7rem',
                                  }}
                                  icon={
                                    <Box sx={{ color: roleInfo.color, display: 'flex', '& > svg': { fontSize: '1rem' } }}>
                                      {roleInfo.icon}
                                    </Box>
                                  }
                                />
                                {member.element && (
                                  <Chip
                                    label={member.element}
                                    size="small"
                                    sx={{
                                      bgcolor: `${getElementColor(member.element)}20`,
                                      color: getElementColor(member.element),
                                      fontWeight: 'medium',
                                      fontSize: '0.7rem',
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                          
                          {canManage && (
                            <Box>
                              <IconButton
                                size="small"
                                onClick={(e) => handleOpenMenu(e, member)}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                        
                        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                          {new Date(member.joinedAt).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}から参加
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
        
        {/* パフォーマンスタブ */}
        {currentTab === 1 && (
          <Box p={3}>
            <Typography variant="body1">
              チームのパフォーマンス統計がここに表示されます。
            </Typography>
          </Box>
        )}
        
        {/* ディスカッションタブ */}
        {currentTab === 2 && (
          <Box p={3}>
            <Typography variant="body1">
              チームディスカッション機能はまだ実装されていません。
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* メンバーメニュー */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        {selectedMember?.role !== 'admin' && (
          <MenuItem onClick={() => handleChangeRole('admin')}>
            <ListItemIcon>
              <ArrowUpwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>管理者に昇格</ListItemText>
          </MenuItem>
        )}
        
        {selectedMember?.role !== 'manager' && selectedMember?.role !== 'member' && (
          <MenuItem onClick={() => handleChangeRole('manager')}>
            <ListItemIcon>
              <ArrowDownwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>マネージャーに変更</ListItemText>
          </MenuItem>
        )}
        
        {selectedMember?.role !== 'member' && (
          <MenuItem onClick={() => handleChangeRole('member')}>
            <ListItemIcon>
              <ArrowDownwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>メンバーに変更</ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleOpenRemoveDialog}>
          <ListItemIcon>
            <RemoveCircleIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="チームから削除" 
            primaryTypographyProps={{ color: 'error' }}
          />
        </MenuItem>
      </Menu>
      
      {/* メンバー削除確認ダイアログ */}
      <Dialog
        open={removeDialogOpen}
        onClose={handleCloseRemoveDialog}
      >
        <DialogTitle>
          メンバーを削除しますか？
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedMember?.name}をチーム「{team.name}」から削除します。
            このメンバーはチームにアクセスできなくなります。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDialog} color="inherit">
            キャンセル
          </Button>
          <Button onClick={handleRemoveMember} color="error">
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamDetail;