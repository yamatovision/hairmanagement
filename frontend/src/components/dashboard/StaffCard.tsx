import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
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

interface StaffCardProps {
  user: IUser;
  status: {
    engagement: number;
    satisfaction: number;
    summary: string;
    trend?: 'improving' | 'stable' | 'declining';
  };
  category: 'followup' | 'stable' | 'watch';
  onClick?: () => void;
}

/**
 * スタッフカードコンポーネント
 * カテゴリ別のスタッフ情報表示用
 */
const StaffCard: React.FC<StaffCardProps> = ({ user, status, category, onClick }) => {
  // カテゴリに基づく色の設定
  const colors = {
    followup: {
      border: '#ffab91',
      bg: '#fff3f0',
      engagement: '#e53935',
    },
    stable: {
      border: '#a5d6a7',
      bg: '#f1f8f1',
      engagement: '#43a047',
    },
    watch: {
      border: '#ffe082',
      bg: '#fffbf0',
      engagement: '#f57c00',
    },
  };

  // ユーザーのイニシャルを取得
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // トレンドアイコンを決定
  const getTrendIcon = () => {
    switch (status.trend) {
      case 'improving':
        return '↑';
      case 'declining':
        return '↓';
      default:
        return '→';
    }
  };

  // トレンドの色を決定
  const getTrendColor = () => {
    switch (status.trend) {
      case 'improving':
        return '#43a047';
      case 'declining':
        return '#e53935';
      default:
        return '#757575';
    }
  };

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        backgroundColor: colors[category].bg,
        borderLeft: `4px solid ${colors[category].border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        } : {},
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            marginRight: 1.5,
            bgcolor: colors[category].border,
            color: '#fff',
            fontSize: '0.875rem',
          }}
        >
          {getInitials(user.name)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, marginBottom: 0.25 }}>
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.role === 'employee' ? 'スタッフ' : 
             user.role === 'manager' ? 'マネージャー' : 'アドミン'}
          </Typography>
        </Box>
      </Box>
      
      <Typography 
        variant="body2" 
        sx={{ 
          marginBottom: 1, 
          color: 'text.primary', 
          lineHeight: 1.4,
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          height: '2.8em',
        }}
      >
        {status.summary}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1.5, fontSize: '0.75rem', color: colors[category].engagement }}>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
          エンゲージメント: {status.engagement}
          <Box component="span" sx={{ ml: 0.5, color: getTrendColor() }}>
            {getTrendIcon()}
          </Box>
        </Typography>
        <Typography variant="caption">
          満足度: {status.satisfaction}
        </Typography>
      </Box>
    </Box>
  );
};

export default StaffCard;