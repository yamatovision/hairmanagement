import React from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  List, 
  ListItem, 
  Divider,
  Chip,
  Paper
} from '@mui/material';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

interface FollowupRecommendation {
  userId: string;
  userName: string;
  userInitials: string;
  elementColor: string;
  urgency: 'low' | 'medium' | 'high';
  reason: string;
  suggestedApproach?: string;
}

interface FollowupListProps {
  recommendations: FollowupRecommendation[];
}

/**
 * フォローアップリストコンポーネント
 * 優先的にフォローが必要なスタッフのリストを表示
 */
const FollowupList: React.FC<FollowupListProps> = ({ recommendations }) => {
  // 緊急度に基づく色とラベルの設定
  const getUrgencyProps = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high':
        return {
          color: '#d32f2f',
          bgColor: 'rgba(239, 83, 80, 0.1)',
          label: '優先度：高',
        };
      case 'medium':
        return {
          color: '#f57c00',
          bgColor: 'rgba(255, 213, 79, 0.2)',
          label: '優先度：中',
        };
      case 'low':
      default:
        return {
          color: '#388e3c',
          bgColor: 'rgba(129, 199, 132, 0.1)',
          label: '優先度：低',
        };
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center' }}>
        <PriorityHighIcon sx={{ fontSize: '1.2rem', marginRight: 1, color: '#ef5350' }} />
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
          重点フォロー対象者
        </Typography>
      </Box>
      
      <List sx={{ padding: 0 }}>
        {recommendations.map((item, index) => {
          const urgency = getUrgencyProps(item.urgency);
          
          return (
            <React.Fragment key={item.userId}>
              <ListItem 
                sx={{ 
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    marginRight: 2, 
                    bgcolor: item.elementColor,
                    width: 40,
                    height: 40,
                  }}
                >
                  {item.userInitials}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {item.userName}
                    </Typography>
                    <Chip 
                      label={urgency.label} 
                      size="small"
                      sx={{ 
                        marginLeft: 1, 
                        bgcolor: urgency.bgColor, 
                        color: urgency.color,
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        height: 24,
                        borderRadius: '12px',
                      }} 
                    />
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ marginBottom: 0.75 }}
                  >
                    {item.reason}
                  </Typography>
                  
                  {item.suggestedApproach && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        padding: '8px 10px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: 1.5,
                        color: 'text.primary',
                      }}
                    >
                      提案：{item.suggestedApproach}
                    </Typography>
                  )}
                </Box>
              </ListItem>
              
              {index < recommendations.length - 1 && (
                <Divider variant="inset" component="li" sx={{ marginLeft: '76px' }} />
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export default FollowupList;