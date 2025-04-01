/**
 * チーム分析コンポーネント
 * 
 * チームの五行バランス、陰陽バランス、メンバー間の相性を分析・表示
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InsightsIcon from '@mui/icons-material/Insights';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import WarningIcon from '@mui/icons-material/Warning';
import LinkIcon from '@mui/icons-material/Link';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { SelectChangeEvent } from '@mui/material/Select';

// チームサービスのインポート
import teamService, { ITeam, ITeamElementalAnalysis } from '../../services/team.service';

// 五行属性の色マップ
const elementColors = {
  'wood': '#66bb6a', // 木: 緑
  'fire': '#ef5350', // 火: 赤
  'earth': '#ffd54f', // 土: 黄
  'metal': '#b0bec5', // 金: 銀/灰色
  'water': '#64b5f6', // 水: 青
  'yin': '#78909c', // 陰: 濃い灰色
  'yang': '#ffee58', // 陽: 明るい黄色
};

// 関係性タイプの色マップ
const relationshipColors = {
  '相生': '#4caf50', // 緑
  '中立': '#ff9800', // オレンジ
  '相剋': '#f44336', // 赤
};

// 優先度の色マップ
const priorityColors = {
  'high': '#f44336',
  'medium': '#fb8c00',
  'low': '#4caf50',
};

// プロパティ型定義
interface TeamAnalyticsProps {
  teamId: string;
  onInviteMember?: () => void;
}

/**
 * チーム分析コンポーネント
 */
const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({ teamId, onInviteMember }) => {
  // 状態管理
  const [team, setTeam] = useState<ITeam | null>(null);
  const [analytics, setAnalytics] = useState<ITeamElementalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>('');
  
  // 英語の五行名を日本語に変換するマップ
  const elementNameMap = {
    'wood': '木',
    'fire': '火',
    'earth': '土',
    'metal': '金',
    'water': '水',
    'yin': '陰',
    'yang': '陽',
  };
  
  // チームデータと分析データの取得
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // チーム情報の取得
        const teamData = await teamService.getTeam(teamId);
        setTeam(teamData);
        
        // チーム分析データの取得
        const analyticsData = await teamService.getTeamAnalytics(teamId);
        setAnalytics(analyticsData);
        
        setIsLoading(false);
      } catch (err) {
        console.error('チームデータ取得エラー:', err);
        setError('チーム分析データの取得に失敗しました。再度お試しください。');
        setIsLoading(false);
      }
    };
    
    fetchTeamData();
  }, [teamId]);
  
  // メンバー選択ハンドラ
  const handleMemberChange = (event: SelectChangeEvent<string>) => {
    setSelectedMember(event.target.value);
  };
  
  // ユーザーのイニシャルを取得する関数
  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  // 五行バランスグラフを表示する関数
  const renderElementalChart = () => {
    if (!analytics) return null;
    
    const { elementDistribution } = analytics;
    const total = Object.values(elementDistribution).reduce((sum, value) => sum + value, 0);
    
    return (
      <Box sx={{ height: 200, width: '100%', position: 'relative' }}>
        {Object.entries(elementDistribution).map(([element, value], index) => {
          const percentage = Math.round((value / total) * 100);
          const offset = index * 72; // 360度 / 5要素 = 72度
          return (
            <Tooltip
              key={element}
              title={`${elementNameMap[element as keyof typeof elementNameMap] || element}: ${percentage}%`}
              arrow
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 120,
                  height: 2,
                  backgroundColor: elementColors[element as keyof typeof elementColors] || '#ccc',
                  transformOrigin: '0 50%',
                  transform: `rotate(${offset}deg)`,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: -4,
                    width: percentage * 1.2, // スケーリング
                    height: 10,
                    backgroundColor: elementColors[element as keyof typeof elementColors] || '#ccc',
                    borderRadius: 5,
                  },
                }}
              />
            </Tooltip>
          );
        })}
        
        {/* 要素ラベル */}
        <Box sx={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <Typography variant="body2">{elementNameMap.wood}</Typography>
        </Box>
        <Box sx={{ position: 'absolute', top: '38%', right: 0, textAlign: 'center' }}>
          <Typography variant="body2">{elementNameMap.fire}</Typography>
        </Box>
        <Box sx={{ position: 'absolute', bottom: 0, right: '15%', textAlign: 'center' }}>
          <Typography variant="body2">{elementNameMap.earth}</Typography>
        </Box>
        <Box sx={{ position: 'absolute', bottom: 0, left: '15%', textAlign: 'center' }}>
          <Typography variant="body2">{elementNameMap.metal}</Typography>
        </Box>
        <Box sx={{ position: 'absolute', top: '38%', left: 0, textAlign: 'center' }}>
          <Typography variant="body2">{elementNameMap.water}</Typography>
        </Box>
        
        {/* 中心円 */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: '2px solid #aaa',
            backgroundColor: '#f5f5f5',
          }}
        />
      </Box>
    );
  };
  
  // 陰陽バランスを表示する関数
  const renderYinYangBalance = () => {
    if (!analytics) return null;
    
    const { yinYangBalance } = analytics;
    const total = yinYangBalance.yin + yinYangBalance.yang;
    const yinPercentage = Math.round((yinYangBalance.yin / total) * 100);
    const yangPercentage = Math.round((yinYangBalance.yang / total) * 100);
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          陰陽バランス
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              flex: 1,
              height: 20,
              borderRadius: '10px 0 0 10px',
              backgroundColor: elementColors.yin,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${yinPercentage}%`,
                height: '100%',
                backgroundColor: elementColors.yin,
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: 8, 
                transform: 'translateY(-50%)',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              陰 {yinPercentage}%
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              height: 20,
              borderRadius: '0 10px 10px 0',
              backgroundColor: elementColors.yang,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: `${yangPercentage}%`,
                height: '100%',
                backgroundColor: elementColors.yang,
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                right: 8, 
                transform: 'translateY(-50%)',
                color: 'rgba(0,0,0,0.7)',
                fontWeight: 'bold'
              }}
            >
              陽 {yangPercentage}%
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {yinPercentage > yangPercentage ? 
            '陰の要素が多く、冷静さと内省的な性質が強いチームです。' : 
            '陽の要素が多く、積極性と外向的な性質が強いチームです。'}
        </Typography>
      </Box>
    );
  };
  
  // 関係性の詳細を表示する関数
  const renderRelationshipDetails = () => {
    if (!analytics || !team) return null;
    
    // 選択されたメンバーの関係性を抽出
    let filteredRelations = analytics.complementaryRelations;
    if (selectedMember) {
      filteredRelations = analytics.complementaryRelations.filter(
        relation => relation.userId1 === selectedMember || relation.userId2 === selectedMember
      );
    }
    
    // ユーザーID → ユーザー情報のマップを作成
    const userMap = (team.members || []).reduce((map, member) => {
      map[member.userId] = member;
      return map;
    }, {} as Record<string, typeof team.members[0]>);
    
    return (
      <List>
        {filteredRelations.map((relation) => {
          const user1 = userMap[relation.userId1];
          const user2 = userMap[relation.userId2];
          
          if (!user1 || !user2) return null;
          
          return (
            <Paper
              key={`${relation.userId1}-${relation.userId2}`}
              elevation={0}
              sx={{ 
                mb: 2, 
                p: 2, 
                border: '1px solid #eee',
                borderLeft: `4px solid ${relationshipColors[relation.relationshipType as keyof typeof relationshipColors] || '#ccc'}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: elementColors[user1.elementalType?.mainElement === '木' ? 'wood' : 
                                        user1.elementalType?.mainElement === '火' ? 'fire' : 
                                        user1.elementalType?.mainElement === '土' ? 'earth' : 
                                        user1.elementalType?.mainElement === '金' ? 'metal' : 
                                        user1.elementalType?.mainElement === '水' ? 'water' : 'earth'] }}>
                  {user1.name ? getInitials(user1.name) : <AccountCircleIcon />}
                </Avatar>
                <Box sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
                  <CompareArrowsIcon sx={{ color: relationshipColors[relation.relationshipType as keyof typeof relationshipColors] || '#ccc' }} />
                  <Typography variant="body2" sx={{ mx: 0.5 }}>
                    {relation.relationshipType}
                  </Typography>
                  <Chip 
                    label={`${relation.compatibilityScore}%`}
                    size="small"
                    color={
                      relation.compatibilityScore >= 70 ? 'success' :
                      relation.compatibilityScore >= 40 ? 'warning' : 'error'
                    }
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: elementColors[user2.elementalType?.mainElement === '木' ? 'wood' : 
                                        user2.elementalType?.mainElement === '火' ? 'fire' : 
                                        user2.elementalType?.mainElement === '土' ? 'earth' : 
                                        user2.elementalType?.mainElement === '金' ? 'metal' : 
                                        user2.elementalType?.mainElement === '水' ? 'water' : 'earth'] }}>
                  {user2.name ? getInitials(user2.name) : <AccountCircleIcon />}
                </Avatar>
              </Box>
              
              <Box sx={{ ml: 6.5 }}>
                <Typography variant="body2" gutterBottom>
                  <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                    {user1.name}
                  </Box>
                  と
                  <Box component="span" sx={{ fontWeight: 'bold', mx: 1 }}>
                    {user2.name}
                  </Box>
                  の関係
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  補完領域: {relation.complementaryAreas.join('、')}
                </Typography>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {relation.relationshipType === '相生' ? 
                    `両者は互いに強め合う関係にあり、${relation.complementaryAreas.join('と')}で効果的に協力できます。` :
                  relation.relationshipType === '中立' ?
                    `両者は中立的な関係で、特に${relation.complementaryAreas.join('と')}の領域での協業が効果的です。` :
                    `両者は互いに抑制し合う関係ですが、${relation.complementaryAreas.join('と')}の領域ではバランスをもたらします。`
                  }
                </Typography>
              </Box>
            </Paper>
          );
        })}
        
        {filteredRelations.length === 0 && (
          <Alert severity="info">
            選択したメンバーの関係性データがありません。
          </Alert>
        )}
      </List>
    );
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!team || !analytics) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        チームデータが見つかりませんでした。
      </Alert>
    );
  }
  
  return (
    <Stack spacing={3}>
      {/* 五行バランス分析 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h5" gutterBottom>
            チーム五行バランス分析
          </Typography>
          <Button
            startIcon={<PersonAddIcon />}
            variant="outlined"
            onClick={onInviteMember}
          >
            メンバーを招待
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  五行分布
                </Typography>
                <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {renderElementalChart()}
                </Box>
                <Box sx={{ mt: 1 }}>
                  {renderYinYangBalance()}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <EmojiObjectsIcon sx={{ mr: 1, color: '#4caf50' }} />
                  <Typography variant="h6" gutterBottom>
                    チームの強み
                  </Typography>
                </Box>
                <List disablePadding>
                  {analytics.teamStrengths.map((strength, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText primary={strength} />
                    </ListItem>
                  ))}
                </List>
                
                <Box display="flex" alignItems="center" mb={1} mt={3}>
                  <WarningIcon sx={{ mr: 1, color: '#f44336' }} />
                  <Typography variant="h6" gutterBottom>
                    チームの課題
                  </Typography>
                </Box>
                <List disablePadding>
                  {analytics.teamWeaknesses.map((weakness, index) => (
                    <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText primary={weakness} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* 最適化提案 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <TrendingUpIcon sx={{ mr: 1 }} />
          <Typography variant="h5" gutterBottom>
            チーム最適化提案
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {analytics.optimizationSuggestions.map((suggestion, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderLeft: `4px solid ${priorityColors[suggestion.priority]}`,
                  height: '100%',
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle1" gutterBottom>
                      {suggestion.type === 'recruitment' ? '採用提案' :
                       suggestion.type === 'reassignment' ? '再配置提案' :
                       '育成提案'}
                    </Typography>
                    <Chip 
                      label={
                        suggestion.priority === 'high' ? '優先度: 高' :
                        suggestion.priority === 'medium' ? '優先度: 中' :
                        '優先度: 低'
                      }
                      size="small"
                      sx={{ 
                        bgcolor: priorityColors[suggestion.priority],
                        color: 'white'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {suggestion.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* メンバー間の相性 */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <LinkIcon sx={{ mr: 1 }} />
          <Typography variant="h5" gutterBottom>
            メンバー間の相性
          </Typography>
        </Box>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>メンバーで絞り込む</InputLabel>
          <Select
            value={selectedMember}
            label="メンバーで絞り込む"
            onChange={handleMemberChange}
          >
            <MenuItem value="">全てのメンバー</MenuItem>
            {team.members?.map((member) => (
              <MenuItem key={member.userId} value={member.userId}>
                {member.name || member.userId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {renderRelationshipDetails()}
      </Paper>
    </Stack>
  );
};

export default TeamAnalytics;