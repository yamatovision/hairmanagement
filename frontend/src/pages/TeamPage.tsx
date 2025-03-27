import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, CircularProgress, Grid, Card, Avatar, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import StaffCard from '../components/dashboard/StaffCard';
import StaffStatusPanel from '../components/dashboard/StaffStatusPanel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FavoriteIcon from '@mui/icons-material/Favorite';

// 五行属性に対応する色の定義
const elementColors = {
  '木': '#4CAF50',
  '火': '#F44336',
  '土': '#FFC107',
  '金': '#BDBDBD',
  '水': '#2196F3'
};

/**
 * チームページコンポーネント
 * チームメンバーの表示と運勢の相性確認のためのページ
 */
const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [todayLuckyUsers, setTodayLuckyUsers] = useState<any[]>([]);
  const [compatibleUsers, setCompatibleUsers] = useState<any[]>([]);
  
  // チームデータをロード（仮実装）
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        // TODO: チームAPIからデータを取得
        // 仮のデータを2秒後に表示
        setTimeout(() => {
          const members = [
            {
              id: '1',
              name: '山田 太郎',
              role: 'マネージャー',
              element: '木',
              compatibility: 85,
              todayLuck: 92,
              avatar: null
            },
            {
              id: '2',
              name: '佐藤 花子',
              role: 'スタッフ',
              element: '火',
              compatibility: 65,
              todayLuck: 78,
              avatar: null
            },
            {
              id: '3',
              name: '鈴木 一郎',
              role: 'スタッフ',
              element: '水',
              compatibility: 90,
              todayLuck: 85,
              avatar: null
            },
            {
              id: '4',
              name: '田中 直樹',
              role: 'スタッフ',
              element: '金',
              compatibility: 72,
              todayLuck: 68,
              avatar: null
            },
            {
              id: '5',
              name: '伊藤 みゆき',
              role: 'スタッフ',
              element: '土',
              compatibility: 81,
              todayLuck: 91,
              avatar: null
            }
          ];
          
          setTeamMembers(members);
          
          // 今日の運の良いメンバーTOP3
          const luckyUsers = [...members].sort((a, b) => b.todayLuck - a.todayLuck).slice(0, 3);
          setTodayLuckyUsers(luckyUsers);
          
          // 今日のあなたと相性の良いメンバーTOP3
          // 実際の実装ではユーザーの属性と他のメンバーの属性を比較して計算
          const compatUsers = [...members].sort((a, b) => b.compatibility - a.compatibility).slice(0, 3);
          setCompatibleUsers(compatUsers);
          
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error('チームデータの取得に失敗しました', error);
        setLoading(false);
      }
    };

    loadTeamData();
  }, []);

  // イニシャルを取得
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mt={4} mb={6}>
        <Typography variant="h4" component="h1" gutterBottom>
          チームメンバー
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          チームメンバーの運勢と相性を確認できます
        </Typography>

        {/* 今日の運の良いメンバー */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <EmojiEventsIcon sx={{ color: '#FFC107', mr: 1 }} />
            <Typography variant="h6">今日一番運の良いメンバー</Typography>
          </Box>
          
          <Grid container spacing={3}>
            {todayLuckyUsers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card elevation={2} sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  position: 'relative',
                  border: index === 0 ? '2px solid #FFC107' : 'none',
                  backgroundColor: index === 0 ? '#FFFDE7' : 'white'
                }}>
                  {index === 0 && (
                    <Chip 
                      label="1位" 
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        backgroundColor: '#FFC107',
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  )}
                  {index === 1 && (
                    <Chip 
                      label="2位" 
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        backgroundColor: '#BDBDBD',
                        color: 'white'
                      }} 
                    />
                  )}
                  {index === 2 && (
                    <Chip 
                      label="3位" 
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        backgroundColor: '#CD7F32',
                        color: 'white'
                      }} 
                    />
                  )}
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: elementColors[member.element as keyof typeof elementColors] || '#9E9E9E',
                        mr: 2
                      }}
                    >
                      {getInitials(member.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {member.role === 'マネージャー' ? 'マネージャー' : 'スタッフ'}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <Chip 
                          label={member.element} 
                          size="small" 
                          sx={{ 
                            backgroundColor: elementColors[member.element as keyof typeof elementColors] || '#9E9E9E',
                            color: 'white',
                            mr: 1
                          }} 
                        />
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          運勢: {member.todayLuck}点
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* 今日のあなたと相性の良いメンバー */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <FavoriteIcon sx={{ color: '#F44336', mr: 1 }} />
            <Typography variant="h6">今日のあなたと相性の良いメンバー</Typography>
          </Box>
          
          <Grid container spacing={3}>
            {compatibleUsers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card elevation={2} sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  position: 'relative',
                  border: index === 0 ? '2px solid #F44336' : 'none',
                  backgroundColor: index === 0 ? '#FFF8F8' : 'white'
                }}>
                  {index === 0 && (
                    <Chip 
                      label="最高相性" 
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        backgroundColor: '#F44336',
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  )}
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: elementColors[member.element as keyof typeof elementColors] || '#9E9E9E',
                        mr: 2
                      }}
                    >
                      {getInitials(member.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {member.role === 'マネージャー' ? 'マネージャー' : 'スタッフ'}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <Chip 
                          label={member.element} 
                          size="small" 
                          sx={{ 
                            backgroundColor: elementColors[member.element as keyof typeof elementColors] || '#9E9E9E',
                            color: 'white',
                            mr: 1
                          }} 
                        />
                        <Typography variant="body2" fontWeight="bold" color="error.main">
                          相性: {member.compatibility}点
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* メンバー一覧 */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            全メンバー一覧
          </Typography>
          <Grid container spacing={3}>
            {teamMembers.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <StaffCard 
                  user={{
                    id: member.id,
                    name: member.name,
                    email: '',
                    birthDate: '',
                    role: 'employee',
                    isActive: true
                  }} 
                  status={{
                    engagement: member.compatibility || 50,
                    satisfaction: member.todayLuck || 70,
                    summary: `${member.element}属性 - 今日の運勢: ${member.todayLuck}点`
                  }}
                  category="stable"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default TeamPage;