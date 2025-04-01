import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Avatar,
  IconButton,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import StaffStatusPanel from '../components/dashboard/StaffStatusPanel';
import SubscriptionManagement from '../components/dashboard/SubscriptionManagement';
import analyticsService from '../services/analytics.service';
import { IUser, ITeamAnalytics } from '../utils/sharedTypes';

/**
 * 経営者ダッシュボードページ
 * チーム全体の状態把握とフォローアップが必要なスタッフの管理
 */
const ManagerDashboardPage: React.FC = () => {
  // タブの状態管理
  const [currentTab, setCurrentTab] = useState<number>(0);
  
  // 分析データの状態管理
  const [teamAnalytics, setTeamAnalytics] = useState<ITeamAnalytics | null>(null);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [followupRecommendations, setFollowupRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 属性に対応する色マップ
  const elementColors = {
    '木': '#81c784', // 緑
    '火': '#ef5350', // 赤
    '土': '#ffd54f', // 黄
    '金': '#b0bec5', // 銀/灰色
    '水': '#64b5f6', // 青
  };
  
  // タブ変更ハンドラー
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };
  
  // ダミーユーザーリスト（本番ではデータベースから取得する）
  const dummyUsers: IUser[] = [
    {
      id: '1',
      name: '田中 健太',
      email: 'tanaka@example.com',
      role: 'employee',
      birthDate: '1990-05-15',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      elementalType: { mainElement: '水', yinYang: '陰' }
    },
    {
      id: '2',
      name: '松本 優子',
      email: 'matsumoto@example.com',
      role: 'employee',
      birthDate: '1992-08-22',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      elementalType: { mainElement: '火', yinYang: '陽' }
    },
    {
      id: '3',
      name: '佐藤 早紀',
      email: 'sato@example.com',
      role: 'employee',
      birthDate: '1988-03-10',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      elementalType: { mainElement: '土', yinYang: '陰' }
    },
    {
      id: '4',
      name: '鈴木 健司',
      email: 'suzuki@example.com',
      role: 'employee',
      birthDate: '1985-11-08',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      elementalType: { mainElement: '金', yinYang: '陽' }
    },
    {
      id: '5',
      name: '山本 裕子',
      email: 'yamamoto@example.com',
      role: 'employee',
      birthDate: '1993-07-30',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      elementalType: { mainElement: '土', yinYang: '陰' }
    },
    {
      id: '6',
      name: '加藤 恵',
      email: 'kato@example.com',
      role: 'employee',
      birthDate: '1987-04-18',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      elementalType: { mainElement: '水', yinYang: '陰' }
    },
    {
      id: '7',
      name: '伊藤 大輔',
      email: 'ito@example.com',
      role: 'employee',
      birthDate: '1991-12-05',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      elementalType: { mainElement: '火', yinYang: '陽' }
    },
    {
      id: '8',
      name: '中村 美咲',
      email: 'nakamura@example.com',
      role: 'employee',
      birthDate: '1994-02-14',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      elementalType: { mainElement: '金', yinYang: '陽' }
    },
    {
      id: '9',
      name: '渡辺 隆',
      email: 'watanabe@example.com',
      role: 'employee',
      birthDate: '1989-09-25',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      elementalType: { mainElement: '水', yinYang: '陰' }
    }
  ];
  
  // コンポーネントマウント時にデータ取得
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // モックデータを直接使用（APIエンドポイントが存在しないため）
        const mockAnalyticsData: ITeamAnalytics = {
          id: 'mock-team-analytics-id',
          period: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
          },
          overallEngagement: 78,
          responseRate: 82,
          sentimentDistribution: {
            positive: 65,
            neutral: 25,
            negative: 10
          },
          topConcerns: [
            { topic: '業務量', frequency: 12, averageSentiment: -0.7 },
            { topic: 'チーム連携', frequency: 8, averageSentiment: -0.5 },
            { topic: '報酬体系', frequency: 5, averageSentiment: -0.6 }
          ],
          topStrengths: [
            { topic: '職場環境', frequency: 15, averageSentiment: 0.8 },
            { topic: '技術サポート', frequency: 10, averageSentiment: 0.7 },
            { topic: '成長機会', frequency: 9, averageSentiment: 0.9 }
          ],
          followUpRecommendations: [
            {
              userId: '1',
              urgency: 'high' as const,
              reason: '過去2週間で急激な満足度低下。技術習得と待遇について複数回の否定的発言あり。',
              suggestedApproach: '新しい技術トレーニングの機会について1対1でのミーティングを実施し、キャリアビジョンと待遇についての対話を行う。'
            },
            {
              userId: '2',
              urgency: 'medium' as const,
              reason: '運勢確認頻度が低下中。対話内容からチーム内人間関係の悩みが検出されている。',
              suggestedApproach: '間接的にチーム活動への参加を促し、コミュニケーションの機会を増やす。必要に応じてメンター制度の活用を検討。'
            },
            {
              userId: '3',
              urgency: 'low' as const,
              reason: 'スキル成長に関する不安の兆候。自己評価が低く、キャリアパスの明確さを求めている。',
              suggestedApproach: '具体的なスキル向上計画を一緒に設定し、成功体験を増やす機会を提供。組織内での将来的なポジションについて対話を行う。'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // 本番環境ではAPIから取得（現在はエンドポイントがないためコメントアウト）
        // const analyticsData = await analyticsService.getTeamAnalytics();
        
        setTeamAnalytics(mockAnalyticsData);
        
        // 個別のスタッフ状態を処理して設定
        processStaffData(dummyUsers, mockAnalyticsData);
        
        // フォローアップ推奨リストを処理
        processFollowupRecommendations(mockAnalyticsData.followUpRecommendations, dummyUsers);
        
      } catch (error) {
        console.error('ダッシュボードデータ取得エラー:', error);
        
        // エラー時にダミーデータを使用
        processDummyData();
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // スタッフデータの処理
  const processStaffData = (users: IUser[], analytics: ITeamAnalytics) => {
    // ユーザーIDごとの状態カテゴリマップ作成
    const urgencyMap: Record<string, 'followup' | 'stable' | 'watch'> = {};
    
    // フォローアップ推奨からカテゴリを設定
    analytics.followUpRecommendations.forEach(rec => {
      urgencyMap[rec.userId] = 'followup';
    });
    
    // 残りのユーザーはランダムに'stable'または'watch'に割り当て（本番では実際のデータに基づく）
    const staffList = users.map(user => {
      // フォローアップが必要でないユーザーは'stable'または'watch'に
      const category = urgencyMap[user.id] || (['stable', 'stable', 'stable', 'watch'][Math.floor(Math.random() * 4)]);
      
      // エンゲージメントと満足度はカテゴリに応じて生成
      let engagement;
      let satisfaction;
      let trend: 'improving' | 'stable' | 'declining' | undefined;
      
      switch (category) {
        case 'followup':
          engagement = Math.floor(Math.random() * 20) + 40; // 40-60
          satisfaction = Math.floor(Math.random() * 20) + 30; // 30-50
          trend = 'declining';
          break;
        case 'stable':
          engagement = Math.floor(Math.random() * 10) + 80; // 80-90
          satisfaction = Math.floor(Math.random() * 10) + 80; // 80-90
          trend = Math.random() < 0.5 ? 'improving' : 'stable';
          break;
        case 'watch':
          engagement = Math.floor(Math.random() * 10) + 70; // 70-80
          satisfaction = Math.floor(Math.random() * 15) + 65; // 65-80
          trend = Math.random() < 0.5 ? 'stable' : 'declining';
          break;
      }
      
      // サマリー文章を状態に応じて設定
      let summary = '';
      if (category === 'followup') {
        summary = ['技術習得と待遇について複数回の否定的発言あり', 'チーム内人間関係の悩みが検出されている', 'キャリアパスの明確さを求めている'][Math.floor(Math.random() * 3)];
      } else if (category === 'stable') {
        summary = ['継続的な高評価と創造性を発揮中', '成長意欲が高く、技術習得に積極的', 'リーダーシップを発揮し、若手の育成に注力', '当初は不安定だったが、最近急速に改善'][Math.floor(Math.random() * 4)];
      } else {
        summary = ['モチベーション向上のための新たな刺激や目標設定が必要', 'エンゲージメントの波が大きく、安定性に欠ける'][Math.floor(Math.random() * 2)];
      }
      
      return {
        user,
        status: {
          engagement,
          satisfaction,
          summary,
          trend,
        },
        category,
      };
    });
    
    setStaffData(staffList);
  };
  
  // フォローアップ推奨の処理
  const processFollowupRecommendations = (
    recommendations: ITeamAnalytics['followUpRecommendations'], 
    users: IUser[]
  ) => {
    // ユーザーIDをキーとしたマップを作成
    const userMap = users.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {} as Record<string, IUser>);
    
    // フォローアップ推奨を処理して表示用データに変換
    const followupList = recommendations.map(rec => {
      const user = userMap[rec.userId];
      if (!user) return null;
      
      // ユーザーのイニシャルを取得
      const initials = user.name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
      
      // 属性の色を取得（未設定の場合はデフォルト色）
      const elementColor = user.elementalType?.mainElement 
        ? elementColors[user.elementalType.mainElement]
        : '#9e9e9e';
      
      return {
        userId: rec.userId,
        userName: user.name,
        userInitials: initials,
        elementColor,
        urgency: rec.urgency,
        reason: rec.reason,
        suggestedApproach: rec.suggestedApproach,
      };
    }).filter(Boolean) as any[];
    
    setFollowupRecommendations(followupList);
  };
  
  // エラー時のダミーデータ処理
  const processDummyData = () => {
    // ダミーのフォローアップ推奨
    const dummyFollowups = [
      {
        userId: '1',
        userName: '田中 健太',
        userInitials: 'TK',
        elementColor: elementColors['水'],
        urgency: 'high' as const,
        reason: '過去2週間で急激な満足度低下。技術習得と待遇について複数回の否定的発言あり。',
        suggestedApproach: '新しい技術トレーニングの機会について1対1でのミーティングを実施し、キャリアビジョンと待遇についての対話を行う。',
      },
      {
        userId: '2',
        userName: '松本 優子',
        userInitials: 'MY',
        elementColor: elementColors['火'],
        urgency: 'medium' as const,
        reason: '運勢確認頻度が低下中。対話内容からチーム内人間関係の悩みが検出されている。',
        suggestedApproach: '間接的にチーム活動への参加を促し、コミュニケーションの機会を増やす。必要に応じてメンター制度の活用を検討。',
      },
      {
        userId: '3',
        userName: '佐藤 早紀',
        userInitials: 'SS',
        elementColor: elementColors['土'],
        urgency: 'low' as const,
        reason: 'スキル成長に関する不安の兆候。自己評価が低く、キャリアパスの明確さを求めている。',
        suggestedApproach: '具体的なスキル向上計画を一緒に設定し、成功体験を増やす機会を提供。組織内での将来的なポジションについて対話を行う。',
      },
    ];
    
    setFollowupRecommendations(dummyFollowups);
    
    // ダミーのスタッフデータ
    const dummyStaffData = dummyUsers.map(user => {
      // 田中、松本、佐藤はフォローアップ必要
      const isFollowup = ['1', '2', '3'].includes(user.id);
      // 鈴木、山本、加藤、伊藤は順調
      const isStable = ['4', '5', '6', '7'].includes(user.id);
      // 中村、渡辺は要注目
      const isWatch = ['8', '9'].includes(user.id);
      
      let category: 'followup' | 'stable' | 'watch';
      let engagement: number;
      let satisfaction: number;
      let summary: string;
      let trend: 'improving' | 'stable' | 'declining' | undefined;
      
      if (isFollowup) {
        category = 'followup';
        engagement = Math.floor(Math.random() * 20) + 40; // 40-60
        satisfaction = Math.floor(Math.random() * 20) + 30; // 30-50
        trend = 'declining';
        summary = ['技術習得と待遇について複数回の否定的発言あり', 'チーム内人間関係の悩みが検出されている', 'キャリアパスの明確さを求めている'][Math.floor(Math.random() * 3)];
      } else if (isStable) {
        category = 'stable';
        engagement = Math.floor(Math.random() * 10) + 80; // 80-90
        satisfaction = Math.floor(Math.random() * 10) + 80; // 80-90
        trend = Math.random() < 0.5 ? 'improving' : 'stable';
        summary = ['継続的な高評価と創造性を発揮中', '成長意欲が高く、技術習得に積極的', 'リーダーシップを発揮し、若手の育成に注力', '当初は不安定だったが、最近急速に改善'][Math.floor(Math.random() * 4)];
      } else { // isWatch
        category = 'watch';
        engagement = Math.floor(Math.random() * 10) + 70; // 70-80
        satisfaction = Math.floor(Math.random() * 15) + 65; // 65-80
        trend = Math.random() < 0.5 ? 'stable' : 'declining';
        summary = ['モチベーション向上のための新たな刺激や目標設定が必要', 'エンゲージメントの波が大きく、安定性に欠ける'][Math.floor(Math.random() * 2)];
      }
      
      return {
        user,
        status: {
          engagement,
          satisfaction,
          summary,
          trend,
        },
        category,
      };
    });
    
    setStaffData(dummyStaffData);
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <Box 
        sx={{ 
          backgroundColor: '#ffffff', 
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography 
          variant="h6"
          sx={{ 
            fontSize: '1.4rem', 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {currentTab === 0 ? (
            <>
              <PeopleIcon 
                sx={{ 
                  marginRight: 1.5, 
                  color: '#ffd54f', // 土の色
                }} 
              />
              スタッフ状態管理
            </>
          ) : (
            <>
              <SubscriptionsIcon 
                sx={{ 
                  marginRight: 1.5, 
                  color: '#3f51b5', // サブスクリプションカラー
                }} 
              />
              サブスクリプション管理
            </>
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton>
            <NotificationsNoneIcon />
          </IconButton>
          <IconButton>
            <SettingsIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: '#b0bec5', width: 36, height: 36 }}>M</Avatar>
        </Box>
      </Box>

      {/* タブナビゲーション */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            aria-label="ダッシュボードタブ"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="スタッフ状態" />
            <Tab label="サブスクリプション" />
          </Tabs>
        </Container>
      </Box>
      
      {/* メインコンテンツ */}
      <Container maxWidth="lg" sx={{ paddingY: 3 }}>
        {currentTab === 0 ? (
          // スタッフ状態タブ
          loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <StaffStatusPanel 
              staffData={staffData}
              followupRecommendations={followupRecommendations}
            />
          )
        ) : (
          // サブスクリプション管理タブ
          <SubscriptionManagement teamId="1" />
        )}
      </Container>
    </Box>
  );
};

export default ManagerDashboardPage;