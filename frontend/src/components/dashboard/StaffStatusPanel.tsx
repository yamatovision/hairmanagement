import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Grid, 
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import StaffCard from './StaffCard';
import FollowupList from './FollowupList';
// import { IUser } from '../../shared/types';
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
  role: 'employee' | 'manager' | 'admin';
  profilePicture?: string;
  elementalType?: ElementalType;
  isActive: boolean;
};

// スタッフ状態の型定義
interface StaffStatus {
  user: IUser;
  status: {
    engagement: number;
    satisfaction: number;
    summary: string;
    trend?: 'improving' | 'stable' | 'declining';
  };
  category: 'followup' | 'stable' | 'watch';
}

// フォローアップ推奨の型定義
interface FollowupRecommendation {
  userId: string;
  userName: string;
  userInitials: string;
  elementColor: string;
  urgency: 'low' | 'medium' | 'high';
  reason: string;
  suggestedApproach?: string;
}

interface StaffStatusPanelProps {
  staffData: StaffStatus[];
  followupRecommendations: FollowupRecommendation[];
  loading?: boolean;
}

/**
 * スタッフ状態管理パネルコンポーネント
 * タブ切替で様々な状態のスタッフを表示
 */
const StaffStatusPanel: React.FC<StaffStatusPanelProps> = ({ 
  staffData, 
  followupRecommendations,
  loading = false
}) => {
  // タブの状態管理
  const [currentTab, setCurrentTab] = useState<string>('followup');
  
  // フィルタメニューの状態管理
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  
  // ソートメニューの状態管理
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  
  // フィルターとソートの開閉状態
  const isFilterMenuOpen = Boolean(filterAnchorEl);
  const isSortMenuOpen = Boolean(sortAnchorEl);
  
  // フィルターとソートの開閉ハンドラー
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenus = () => {
    setFilterAnchorEl(null);
    setSortAnchorEl(null);
  };
  
  // タブ変更ハンドラー
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };
  
  // カテゴリー別のスタッフデータをフィルタリング
  const getStaffByCategory = (category: 'followup' | 'stable' | 'watch' | 'all') => {
    if (category === 'all') return staffData;
    return staffData.filter(staff => staff.category === category);
  };
  
  // カテゴリー別のスタッフ数を取得
  const getCategoryCount = (category: 'followup' | 'stable' | 'watch' | 'all') => {
    return getStaffByCategory(category).length;
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 3, 
        overflow: 'hidden', 
        marginBottom: 3,
        border: '1px solid #e0e0e0'
      }}
    >
      {/* セクションヘッダー */}
      <Box 
        sx={{ 
          padding: '18px 20px', 
          borderBottom: '1px solid #e0e0e0', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon 
            sx={{ 
              marginRight: 1.25, 
              color: '#ef5350', 
              fontSize: '1.3rem'
            }} 
          />
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
            スタッフ状態管理
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            size="small"
            startIcon={<SortIcon />}
            onClick={handleSortClick}
            sx={{ 
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            優先度順
          </Button>
          <Menu
            anchorEl={sortAnchorEl}
            open={isSortMenuOpen}
            onClose={handleCloseMenus}
          >
            <MenuItem onClick={handleCloseMenus}>優先度順</MenuItem>
            <MenuItem onClick={handleCloseMenus}>エンゲージメント順</MenuItem>
            <MenuItem onClick={handleCloseMenus}>更新日順</MenuItem>
          </Menu>
          
          <Button
            size="small"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{ 
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            フィルター
          </Button>
          <Menu
            anchorEl={filterAnchorEl}
            open={isFilterMenuOpen}
            onClose={handleCloseMenus}
          >
            <MenuItem onClick={handleCloseMenus}>全てのスタッフ</MenuItem>
            <MenuItem onClick={handleCloseMenus}>担当者のみ</MenuItem>
            <MenuItem onClick={handleCloseMenus}>新人スタッフ</MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* タブナビゲーション */}
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange}
        sx={{ 
          borderBottom: '1px solid #e0e0e0',
          '& .MuiTabs-indicator': {
            backgroundColor: '#ef5350',
            height: 3,
          }
        }}
      >
        <Tab 
          label={`要フォロー (${getCategoryCount('followup')})`} 
          value="followup"
          sx={{ 
            textTransform: 'none',
            fontWeight: currentTab === 'followup' ? 500 : 400,
            color: currentTab === 'followup' ? '#ef5350' : 'text.secondary',
            '&.Mui-selected': {
              color: '#ef5350',
            }
          }}
          icon={<PriorityHighIcon sx={{ fontSize: '1.2rem' }} />}
          iconPosition="start"
        />
        <Tab 
          label={`順調 (${getCategoryCount('stable')})`} 
          value="stable"
          sx={{ 
            textTransform: 'none',
            fontWeight: currentTab === 'stable' ? 500 : 400,
            color: currentTab === 'stable' ? '#43a047' : 'text.secondary',
            '&.Mui-selected': {
              color: '#43a047',
            }
          }}
          icon={<ThumbUpIcon sx={{ fontSize: '1.2rem' }} />}
          iconPosition="start"
        />
        <Tab 
          label={`要注目 (${getCategoryCount('watch')})`} 
          value="watch"
          sx={{ 
            textTransform: 'none',
            fontWeight: currentTab === 'watch' ? 500 : 400,
            color: currentTab === 'watch' ? '#f57c00' : 'text.secondary',
            '&.Mui-selected': {
              color: '#f57c00',
            }
          }}
          icon={<VisibilityIcon sx={{ fontSize: '1.2rem' }} />}
          iconPosition="start"
        />
        <Tab 
          label={`全員 (${getCategoryCount('all')})`} 
          value="all"
          sx={{ 
            textTransform: 'none',
            fontWeight: currentTab === 'all' ? 500 : 400,
            color: currentTab === 'all' ? '#757575' : 'text.secondary',
            '&.Mui-selected': {
              color: '#757575',
            }
          }}
          icon={<PeopleAltIcon sx={{ fontSize: '1.2rem' }} />}
          iconPosition="start"
        />
      </Tabs>
      
      {/* タブコンテンツ */}
      <Box sx={{ padding: '20px' }}>
        {/* 要フォロータブ */}
        {currentTab === 'followup' && (
          <FollowupList recommendations={followupRecommendations} />
        )}
        
        {/* 順調タブ */}
        {currentTab === 'stable' && (
          <Grid container spacing={2}>
            {getStaffByCategory('stable').map((staffItem) => (
              <Grid item xs={12} sm={6} md={4} key={staffItem.user.id}>
                <StaffCard 
                  user={staffItem.user}
                  status={staffItem.status}
                  category={staffItem.category}
                  onClick={() => console.log('スタッフ詳細', staffItem.user.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* 要注目タブ */}
        {currentTab === 'watch' && (
          <Grid container spacing={2}>
            {getStaffByCategory('watch').map((staffItem) => (
              <Grid item xs={12} sm={6} md={4} key={staffItem.user.id}>
                <StaffCard 
                  user={staffItem.user}
                  status={staffItem.status}
                  category={staffItem.category}
                  onClick={() => console.log('スタッフ詳細', staffItem.user.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* 全員タブ */}
        {currentTab === 'all' && (
          <Grid container spacing={2}>
            {getStaffByCategory('all').length > 0 ? (
              getStaffByCategory('all').map((staffItem) => (
                <Grid item xs={12} sm={6} md={4} key={staffItem.user.id}>
                  <StaffCard 
                    user={staffItem.user}
                    status={staffItem.status}
                    category={staffItem.category}
                    onClick={() => console.log('スタッフ詳細', staffItem.user.id)}
                  />
                </Grid>
              ))
            ) : (
              <Box sx={{ padding: '16px', textAlign: 'center', color: 'text.secondary', width: '100%' }}>
                全スタッフ表示は開発中です...
              </Box>
            )}
          </Grid>
        )}
        
        {/* さらに表示ボタン */}
        <Box sx={{ marginTop: 2.5, textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ExpandMoreIcon />}
            sx={{ 
              borderRadius: '20px', 
              textTransform: 'none',
              borderColor: '#e0e0e0',
              color: 'text.secondary',
              '&:hover': {
                borderColor: '#bdbdbd',
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            さらに表示
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default StaffStatusPanel;