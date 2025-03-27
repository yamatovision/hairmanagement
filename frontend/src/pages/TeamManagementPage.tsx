/**
 * チーム管理ページ
 * 
 * チームの作成、編集、メンバー管理などの機能を提供するページ
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TeamList from '../components/team/TeamList';
import TeamDetail from '../components/team/TeamDetail';
import TeamForm from '../components/team/TeamForm';
import InvitationForm from '../components/team/InvitationForm';
import team2Service from '../services/team2.service';
import { IInvitation, InvitationRole } from '../utils/sharedTypes';
import { InvitationStatus } from '../types/models';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
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

/**
 * チーム管理ページコンポーネント
 */
const TeamManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId?: string }>();
  const { user } = useAuth();
  
  // 各種状態
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);
  const [invitations, setInvitations] = useState<IInvitation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // モーダルの状態
  const [teamFormOpen, setTeamFormOpen] = useState<boolean>(false);
  const [invitationFormOpen, setInvitationFormOpen] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<ITeam | null>(null);
  
  // 初期データ読み込み
  useEffect(() => {
    fetchTeams();
  }, []);
  
  // teamIdが指定されている場合、そのチームを選択
  useEffect(() => {
    if (teamId && teams.length > 0) {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        handleViewTeam(team.id);
      }
    }
  }, [teamId, teams]);
  
  // チーム一覧を取得
  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const fetchedTeams = await team2Service.getAllTeams();
      // 型変換してセット
      const formattedTeams: ITeam[] = fetchedTeams.map(team => {
        // メンバーを変換
        const members = team.members || [];
        let convertedMembers: Array<{userId: string; role: string; joinedAt: string | Date}> = [];
        
        if (Array.isArray(members)) {
          if (members.length > 0) {
            if (typeof members[0] === 'string') {
              convertedMembers = members.map((userId: string) => ({
                userId,
                role: 'member',
                joinedAt: team.createdAt
              }));
            } else if (typeof members[0] === 'object') {
              convertedMembers = members as any[];
            }
          }
        }

        return {
          id: team.id,
          name: team.name,
          description: team.description,
          isActive: team.isActive,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
          ownerId: team.ownerId,
          admins: team.admins,
          members: convertedMembers
        };
      });
      setTeams(formattedTeams);
    } catch (error) {
      console.error('チーム取得エラー:', error);
      setError('チームの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 特定のチームを取得
  const fetchTeamById = async (id: string) => {
    setIsLoading(true);
    try {
      const team = await team2Service.getTeamById(id);
      // 型変換してセット
      // メンバーを変換
      const members = team.members || [];
      let convertedMembers: Array<{userId: string; role: string; joinedAt: string | Date}> = [];
      
      if (Array.isArray(members)) {
        if (members.length > 0) {
          if (typeof members[0] === 'string') {
            convertedMembers = members.map((userId: string) => ({
              userId,
              role: 'member',
              joinedAt: team.createdAt
            }));
          } else if (typeof members[0] === 'object') {
            convertedMembers = members as any[];
          }
        }
      }

      const formattedTeam: ITeam = {
        id: team.id,
        name: team.name,
        description: team.description,
        isActive: team.isActive,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        ownerId: team.ownerId,
        admins: team.admins,
        members: convertedMembers
      };
      setSelectedTeam(formattedTeam);
      
      // チームの招待も取得
      try {
        const teamInvitations = await team2Service.getTeamInvitations(id);
        setInvitations(teamInvitations);
      } catch (invitationError) {
        console.error('招待取得エラー:', invitationError);
      }
    } catch (error) {
      console.error('チーム取得エラー:', error);
      setError('チームの取得に失敗しました。');
      setSelectedTeam(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // チーム作成モーダルを開く
  const handleOpenCreateTeam = () => {
    setEditingTeam(null);
    setTeamFormOpen(true);
  };
  
  // チーム編集モーダルを開く
  const handleOpenEditTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setEditingTeam(team);
      setTeamFormOpen(true);
    }
  };
  
  // チーム表示
  const handleViewTeam = (teamId: string) => {
    navigate(`/teams/${teamId}`);
    fetchTeamById(teamId);
  };
  
  // チームフォームを閉じる
  const handleCloseTeamForm = () => {
    setTeamFormOpen(false);
    setEditingTeam(null);
  };
  
  // 招待フォームを開く
  const handleOpenInvitationForm = (teamId?: string) => {
    if (teamId) {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        setSelectedTeam(team);
      }
    }
    setInvitationFormOpen(true);
  };
  
  // 招待フォームを閉じる
  const handleCloseInvitationForm = () => {
    setInvitationFormOpen(false);
  };
  
  // チーム作成/編集処理
  const handleSubmitTeam = async (teamData: any) => {
    setIsSubmitting(true);
    try {
      if (editingTeam) {
        // チーム更新
        const updatedTeam = await team2Service.updateTeam(editingTeam.id, teamData);
        
        // 更新されたチームのメンバーを適切に変換
        const members = updatedTeam.members || [];
        let convertedMembers: Array<{userId: string; role: string; joinedAt: string | Date}> = [];
        
        if (Array.isArray(members)) {
          if (members.length > 0) {
            if (typeof members[0] === 'string') {
              convertedMembers = members.map((userId: string) => ({
                userId,
                role: 'member',
                joinedAt: updatedTeam.createdAt
              }));
            } else if (typeof members[0] === 'object') {
              convertedMembers = members as any[];
            }
          }
        }
        
        const formattedTeam: ITeam = {
          id: updatedTeam.id,
          name: updatedTeam.name,
          description: updatedTeam.description,
          isActive: updatedTeam.isActive,
          createdAt: updatedTeam.createdAt,
          updatedAt: updatedTeam.updatedAt,
          ownerId: updatedTeam.ownerId,
          admins: updatedTeam.admins,
          members: convertedMembers
        };
        
        setTeams(teams.map(t => t.id === formattedTeam.id ? formattedTeam : t));
        if (selectedTeam?.id === formattedTeam.id) {
          setSelectedTeam(formattedTeam);
        }
        setSuccessMessage('チームが更新されました');
      } else {
        // チーム作成
        const newTeam = await team2Service.createTeam(teamData);
        
        // 新しいチームのメンバーを適切に変換
        const members = newTeam.members || [];
        let convertedMembers: Array<{userId: string; role: string; joinedAt: string | Date}> = [];
        
        if (Array.isArray(members)) {
          if (members.length > 0) {
            if (typeof members[0] === 'string') {
              convertedMembers = members.map((userId: string) => ({
                userId,
                role: 'member',
                joinedAt: newTeam.createdAt
              }));
            } else if (typeof members[0] === 'object') {
              convertedMembers = members as any[];
            }
          }
        }
        
        const formattedTeam: ITeam = {
          id: newTeam.id,
          name: newTeam.name,
          description: newTeam.description,
          isActive: newTeam.isActive,
          createdAt: newTeam.createdAt,
          updatedAt: newTeam.updatedAt,
          ownerId: newTeam.ownerId,
          admins: newTeam.admins,
          members: convertedMembers
        };
        
        setTeams([...teams, formattedTeam]);
        setSuccessMessage('チームが作成されました');
      }
      handleCloseTeamForm();
    } catch (error) {
      console.error('チーム保存エラー:', error);
      setError('チームの保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // チーム削除処理
  const handleDeleteTeam = async (teamId: string) => {
    try {
      await team2Service.deleteTeam(teamId);
      setTeams(teams.filter(t => t.id !== teamId));
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null);
        navigate('/teams');
      }
      setSuccessMessage('チームが削除されました');
    } catch (error) {
      console.error('チーム削除エラー:', error);
      setError('チームの削除に失敗しました。');
    }
  };
  
  // メンバー招待処理
  const handleSubmitInvitation = async (invitationData: any) => {
    setIsSubmitting(true);
    try {
      const result = await team2Service.createInvitation(invitationData);
      // 招待一覧を更新（実際のAPI呼び出しなら再取得）
      if (selectedTeam) {
        const updatedInvitations = await team2Service.getTeamInvitations(selectedTeam.id);
        setInvitations(updatedInvitations);
      }
      setSuccessMessage('招待が送信されました');
    } catch (error) {
      console.error('招待送信エラー:', error);
      setError('招待の送信に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 招待キャンセル処理
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await team2Service.cancelInvitation(invitationId);
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      setSuccessMessage('招待がキャンセルされました');
    } catch (error) {
      console.error('招待キャンセルエラー:', error);
      setError('招待のキャンセルに失敗しました。');
    }
  };
  
  // 招待再送信処理
  const handleResendInvitation = async (invitationId: string) => {
    try {
      await team2Service.resendInvitation(invitationId);
      setSuccessMessage('招待が再送信されました');
    } catch (error) {
      console.error('招待再送信エラー:', error);
      setError('招待の再送信に失敗しました。');
    }
  };
  
  // メンバー削除処理
  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    
    try {
      await team2Service.removeTeamMember(selectedTeam.id, userId);
      // チーム情報を再取得
      await fetchTeamById(selectedTeam.id);
      setSuccessMessage('メンバーが削除されました');
    } catch (error) {
      console.error('メンバー削除エラー:', error);
      setError('メンバーの削除に失敗しました。');
    }
  };
  
  // メンバーの役割変更処理
  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!selectedTeam) return;
    
    try {
      // このAPIは実際のAPIに合わせて変更する必要があります
      await team2Service.addTeamMember(selectedTeam.id, {
        userId,
        role: newRole as 'admin' | 'member'
      });
      // チーム情報を再取得
      await fetchTeamById(selectedTeam.id);
      setSuccessMessage('メンバーの役割が変更されました');
    } catch (error) {
      console.error('役割変更エラー:', error);
      setError('役割の変更に失敗しました。');
    }
  };
  
  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  };
  
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        {/* パンくずリスト */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="パンくず"
          sx={{ mb: 3 }}
        >
          <Link
            color="inherit"
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            ホーム
          </Link>
          <Link
            color="inherit"
            href="#"
            onClick={(e) => { e.preventDefault(); navigate('/teams'); }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            チーム
          </Link>
          {selectedTeam && (
            <Typography color="textPrimary">
              {selectedTeam.name}
            </Typography>
          )}
        </Breadcrumbs>
        
        {/* ページタイトル */}
        <Typography variant="h4" component="h1" gutterBottom>
          チーム管理
        </Typography>
        
        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* メインコンテンツ */}
        {!selectedTeam ? (
          <TeamList
            teams={teams}
            isLoading={isLoading}
            userRole={user?.role || 'employee'}
            onCreateTeam={handleOpenCreateTeam}
            onEditTeam={handleOpenEditTeam}
            onDeleteTeam={handleDeleteTeam}
            onInviteMembers={handleOpenInvitationForm}
            onViewTeam={handleViewTeam}
          />
        ) : (
          <Box>
            <Box display="flex" justifyContent="flex-start" mb={3}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedTeam(null);
                  navigate('/teams');
                }}
              >
                ← チーム一覧に戻る
              </Button>
            </Box>
            
            <TeamDetail
              team={selectedTeam}
              isLoading={isLoading}
              error={error}
              userRole={user?.role || 'employee'}
              currentUserId={user?.id || ''}
              onInviteMembers={() => handleOpenInvitationForm(selectedTeam.id)}
              onEditTeam={() => handleOpenEditTeam(selectedTeam.id)}
              onRemoveMember={handleRemoveMember}
              onChangeRole={handleChangeRole}
            />
          </Box>
        )}
        
        {/* モーダル */}
        <TeamForm
          open={teamFormOpen}
          onClose={handleCloseTeamForm}
          onSubmit={handleSubmitTeam}
          team={editingTeam}
          isLoading={isSubmitting}
          error={error}
        />
        
        <InvitationForm
          open={invitationFormOpen}
          onClose={handleCloseInvitationForm}
          onSubmit={handleSubmitInvitation}
          onCancelInvitation={handleCancelInvitation}
          onResendInvitation={handleResendInvitation}
          team={selectedTeam}
          invitations={invitations}
          isLoading={isSubmitting}
          error={error}
        />
        
        {/* 成功通知 */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={successMessage}
        />
      </Box>
    </Container>
  );
};

export default TeamManagementPage;