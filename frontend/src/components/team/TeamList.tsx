/**
 * チーム一覧コンポーネント
 * 
 * ユーザーが所属または管理するチームを一覧表示します
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  CardActions,
  Typography, 
  Button, 
  Chip, 
  Avatar, 
  IconButton, 
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Badge,
  AvatarGroup
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import MailIcon from '@mui/icons-material/Mail';
import AddIcon from '@mui/icons-material/Add';
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
import { useNavigate } from 'react-router-dom';

// プロパティ型定義
interface TeamListProps {
  teams: ITeam[];
  isLoading: boolean;
  userRole: string;
  onCreateTeam: () => void;
  onEditTeam: (teamId: string) => void;
  onDeleteTeam: (teamId: string) => void;
  onInviteMembers: (teamId: string) => void;
  onViewTeam: (teamId: string) => void;
}

// 役割に応じた色を返す関数
const getRoleColor = (role: string) => {
  switch (role) {
    case 'owner':
      return '#8C54FF'; // 紫
    case 'admin':
      return '#2196F3'; // 青
    case 'member':
      return '#4CAF50'; // 緑
    default:
      return '#757575'; // グレー
  }
};

// ユーザーのイニシャルを取得する関数
const getInitials = (name: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
};

// ユーザーとチームの関係を判定
const getUserTeamRole = (team: ITeam, userId: string): 'owner' | 'admin' | 'member' => {
  if (team.ownerId === userId) return 'owner';
  if (team.admins && team.admins.includes(userId)) return 'admin';
  return 'member';
};

const TeamList: React.FC<TeamListProps> = ({ 
  teams, 
  isLoading, 
  userRole, 
  onCreateTeam, 
  onEditTeam, 
  onDeleteTeam, 
  onInviteMembers,
  onViewTeam
}) => {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  
  const isSuperAdmin = userRole === 'superadmin';
  const canCreateTeam = ['admin', 'superadmin'].includes(userRole);
  
  // 削除確認ダイアログを開く
  const handleOpenDeleteDialog = (teamId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTeamToDelete(teamId);
    setDeleteConfirmOpen(true);
  };
  
  // 削除確認ダイアログを閉じる
  const handleCloseDeleteDialog = () => {
    setDeleteConfirmOpen(false);
    setTeamToDelete(null);
  };
  
  // 削除を実行
  const handleConfirmDelete = () => {
    if (teamToDelete) {
      onDeleteTeam(teamToDelete);
      handleCloseDeleteDialog();
    }
  };
  
  // チーム編集ハンドラ
  const handleEditTeam = (teamId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTeam(teamId);
  };
  
  // 招待ハンドラ
  const handleInvite = (teamId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onInviteMembers(teamId);
  };
  
  // チーム詳細ページへの遷移
  const handleViewTeam = (teamId: string) => {
    onViewTeam(teamId);
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            チーム管理
          </Typography>
          {canCreateTeam && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onCreateTeam}
            >
              新しいチームを作成
            </Button>
          )}
        </Box>
        
        {teams.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#f9f9f9' }}>
            <Typography variant="body1" color="textSecondary" mb={2}>
              まだチームがありません
            </Typography>
            {canCreateTeam && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={onCreateTeam}
              >
                チームを作成する
              </Button>
            )}
          </Card>
        ) : (
          <Grid container spacing={3}>
            {teams.map((team) => {
              // サンプルとして固定のユーザーIDを設定（実際の実装では現在のユーザーIDを使用）
              const currentUserId = "sample-user-id";
              const userTeamRole = isSuperAdmin ? 'admin' : getUserTeamRole(team, currentUserId);
              const totalMembers = (team.members?.length || 0) + (team.admins?.length || 0) + 1; // +1 for owner
              const pendingInvites = 2; // サンプル値（実際にはAPIから取得）
              
              return (
                <Grid item xs={12} sm={6} md={4} key={team.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: '0.3s',
                      '&:hover': {
                        boxShadow: 6,
                      },
                      position: 'relative'
                    }}
                  >
                    {/* ユーザーの役割を示すマーカー */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        width: 15, 
                        height: 15, 
                        borderRadius: '0 4px 0 15px',
                        bgcolor: getRoleColor(userTeamRole)
                      }} 
                    />
                    
                    <CardActionArea 
                      onClick={() => handleViewTeam(team.id)}
                      sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="h6" component="h2" noWrap>
                            {team.name}
                          </Typography>
                          <Chip 
                            label={userTeamRole === 'owner' ? 'オーナー' : userTeamRole === 'admin' ? '管理者' : 'メンバー'} 
                            size="small"
                            sx={{ 
                              bgcolor: getRoleColor(userTeamRole),
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ 
                            mt: 1,
                            mb: 2,
                            minHeight: '40px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {team.description || 'チームの説明はありません'}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" mt={2}>
                          <GroupIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" color="textSecondary">
                            {totalMembers}人のメンバー
                          </Typography>
                        </Box>
                        
                        <Box mt={2}>
                          <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
                            {/* 実際の実装ではチームメンバーのアバターを表示 */}
                            <Avatar sx={{ bgcolor: '#8C54FF', width: 30, height: 30, fontSize: '0.8rem' }}>
                              {getInitials('Team Owner')}
                            </Avatar>
                            <Avatar sx={{ bgcolor: '#2196F3', width: 30, height: 30, fontSize: '0.8rem' }}>
                              {getInitials('Admin User')}
                            </Avatar>
                            <Avatar sx={{ bgcolor: '#4CAF50', width: 30, height: 30, fontSize: '0.8rem' }}>
                              {getInitials('Team Member')}
                            </Avatar>
                            {totalMembers > 3 && (
                              <Avatar sx={{ bgcolor: '#757575', width: 30, height: 30, fontSize: '0.8rem' }}>
                                +{totalMembers - 3}
                              </Avatar>
                            )}
                          </AvatarGroup>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    
                    <CardActions sx={{ justifyContent: 'space-between', pt: 0, pb: 1, px: 2 }}>
                      <Box>
                        {(userTeamRole === 'owner' || userTeamRole === 'admin' || isSuperAdmin) && (
                          <Tooltip title="メンバーを招待">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => handleInvite(team.id, e)}
                            >
                              <Badge badgeContent={pendingInvites} color="error" max={99}>
                                <MailIcon fontSize="small" />
                              </Badge>
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      
                      <Box>
                        {(userTeamRole === 'owner' || userTeamRole === 'admin' || isSuperAdmin) && (
                          <Tooltip title="チーム設定">
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleEditTeam(team.id, e)}
                            >
                              <SettingsIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {(userTeamRole === 'owner' || isSuperAdmin) && (
                          <Tooltip title="チームを削除">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={(e) => handleOpenDeleteDialog(team.id, e)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
      
      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          チームを削除しますか？
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            このチームを削除すると、すべてのメンバーシップ情報が失われます。
            この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            キャンセル
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TeamList;