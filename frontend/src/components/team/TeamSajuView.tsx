/**
 * チーム四柱推命情報表示コンポーネント
 * 
 * チームメンバーの四柱推命情報（陰陽五行属性と干支）を表示
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import React, { useState, useEffect } from 'react';
import { ElementType } from '../common/ElementTag';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { ITeam } from '../../services/team.service';
import teamService from '../../services/team.service';
import ElementTag from '../common/ElementTag';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';

// 五行属性の色マップ
const elementColors = {
  '木': '#a5d6a7', // 緑
  '火': '#ffab91', // 赤
  '土': '#d7ccc8', // 黄土色
  '金': '#e0e0e0', // 銀/白
  '水': '#81d4fa', // 青
};

// 干支色マップ
const stemBranchColors = {
  // 十干の色
  '甲': '#4CAF50', // 木の陽
  '乙': '#8BC34A', // 木の陰
  '丙': '#FF5722', // 火の陽
  '丁': '#FF9800', // 火の陰
  '戊': '#FFC107', // 土の陽
  '己': '#FFE082', // 土の陰
  '庚': '#B0BEC5', // 金の陽
  '辛': '#E0E0E0', // 金の陰
  '壬': '#03A9F4', // 水の陽
  '癸': '#81D4FA', // 水の陰
  
  // 十二支の色
  '子': '#0D47A1', // 水
  '丑': '#795548', // 土
  '寅': '#2E7D32', // 木
  '卯': '#388E3C', // 木
  '辰': '#5D4037', // 土
  '巳': '#D84315', // 火
  '午': '#C62828', // 火
  '未': '#8D6E63', // 土
  '申': '#9E9E9E', // 金
  '酉': '#757575', // 金
  '戌': '#6D4C41', // 土
  '亥': '#1565C0', // 水
};

// 十神関係の表示色
const tenGodColors = {
  '比肩': '#4CAF50', // 緑（同級）
  '劫財': '#8BC34A', // 薄緑（競合）
  '食神': '#FFC107', // 黄色（力を与える）
  '傷官': '#FFD54F', // 薄黄（影響力）
  '偏財': '#2196F3', // 青（富）
  '正財': '#90CAF9', // 薄青（安定的な富）
  '偏官': '#F44336', // 赤（権力）
  '正官': '#EF9A9A', // 薄赤（規律）
  '偏印': '#9C27B0', // 紫（知恵）
  '印綬': '#CE93D8', // 薄紫（知識）
};

interface TeamSajuViewProps {
  teamId: string;
}

/**
 * チーム四柱推命情報表示コンポーネント
 */
const TeamSajuView: React.FC<TeamSajuViewProps> = ({ teamId }) => {
  // 状態管理
  const [team, setTeam] = useState<ITeam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // チームデータの取得
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // チーム情報の取得
        const teamData = await teamService.getTeam(teamId);
        setTeam(teamData);
        
        setIsLoading(false);
      } catch (err) {
        console.error('チームデータ取得エラー:', err);
        setError('チーム情報の取得に失敗しました。再度お試しください。');
        setIsLoading(false);
      }
    };
    
    fetchTeamData();
  }, [teamId]);
  
  // ユーザーのイニシャルを取得する関数
  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
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
  
  if (!team) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        チームデータが見つかりませんでした。
      </Alert>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <GroupIcon sx={{ mr: 1 }} />
          <Typography variant="h5" component="h2">
            {team.name}のメンバー四柱推命情報
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {team.members?.map((member) => (
            <Grid item xs={12} md={6} lg={4} key={member.userId}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  {/* メンバー基本情報 */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: member.elementalType?.mainElement ?
                          elementColors[member.elementalType.mainElement as keyof typeof elementColors] : '#bdbdbd',
                        width: 50,
                        height: 50,
                        mr: 2
                      }}
                    >
                      {member.name ? getInitials(member.name) : '?'}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="h6">{member.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.role}
                      </Typography>
                      
                      {/* 陰陽五行タグ */}
                      <Box sx={{ display: 'flex', mt: 0.5 }}>
                        {member.elementalType?.mainElement && (
                          <ElementTag
                            element={member.elementalType.mainElement as ElementType}
                            showYinYang={true}
                            yin={member.elementalType.yinYang === '陰'}
                            size="sm"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* 四柱推命情報 */}
                  <Typography variant="subtitle2" gutterBottom>
                    四柱推命情報
                  </Typography>
                  
                  {/* 干支表示 - モックデータ（実際には各メンバーの四柱情報を取得） */}
                  <TableContainer component={Box} sx={{ my: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>柱</TableCell>
                          <TableCell>干支</TableCell>
                          <TableCell>要素</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {['年柱', '月柱', '日柱', '時柱'].map((pillar, index) => {
                          // モックデータ（実際にはバックエンドからの情報を使用）
                          const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
                          const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
                          const randomStem = stems[Math.floor(Math.random() * stems.length)];
                          const randomBranch = branches[Math.floor(Math.random() * branches.length)];
                          
                          // 五行属性のマッピング（実際には正確な計算を使用）
                          const stemElements: Record<string, string> = {
                            '甲': '木', '乙': '木',
                            '丙': '火', '丁': '火',
                            '戊': '土', '己': '土',
                            '庚': '金', '辛': '金',
                            '壬': '水', '癸': '水'
                          };
                          
                          const branchElements: Record<string, string> = {
                            '子': '水', '丑': '土',
                            '寅': '木', '卯': '木',
                            '辰': '土', '巳': '火',
                            '午': '火', '未': '土',
                            '申': '金', '酉': '金',
                            '戌': '土', '亥': '水'
                          };
                          
                          return (
                            <TableRow key={pillar}>
                              <TableCell>{pillar}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-block',
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      bgcolor: stemBranchColors[randomStem as keyof typeof stemBranchColors],
                                      color: 'white',
                                      textAlign: 'center',
                                      lineHeight: '24px',
                                      fontSize: '0.75rem',
                                      mr: 0.5
                                    }}
                                  >
                                    {randomStem}
                                  </Box>
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-block',
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      bgcolor: stemBranchColors[randomBranch as keyof typeof stemBranchColors],
                                      color: 'white',
                                      textAlign: 'center',
                                      lineHeight: '24px',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    {randomBranch}
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex' }}>
                                  <ElementTag
                                    element={stemElements[randomStem] as ElementType}
                                    size="sm"
                                  />
                                  <Box style={{ marginLeft: 4 }}>
                                    <ElementTag
                                      element={branchElements[randomBranch] as ElementType}
                                      size="sm"
                                    />
                                  </Box>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* 十神関係（モック） */}
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    他メンバーとの相互関係
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {/* 他のメンバーとの関係をモックデータで表示 */}
                    {team.members
                      ?.filter(m => m.userId !== member.userId)
                      .slice(0, 3) // 表示数を制限
                      .map((otherMember) => {
                        // 十神関係（モックデータ）
                        const tenGods = [
                          '比肩', '劫財', '食神', '傷官', '偏財',
                          '正財', '偏官', '正官', '偏印', '印綬'
                        ];
                        const randomTenGod = tenGods[Math.floor(Math.random() * tenGods.length)];
                        
                        return (
                          <Tooltip
                            key={otherMember.userId}
                            title={`${otherMember.name || 'ユーザー'}との関係: ${randomTenGod}`}
                            arrow
                          >
                            <Chip
                              avatar={
                                <Avatar
                                  sx={{
                                    bgcolor: tenGodColors[randomTenGod as keyof typeof tenGodColors],
                                    width: 24,
                                    height: 24,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {otherMember.name ? getInitials(otherMember.name) : '?'}
                                </Avatar>
                              }
                              label={randomTenGod}
                              size="small"
                              sx={{
                                borderColor: tenGodColors[randomTenGod as keyof typeof tenGodColors],
                                bgcolor: 'transparent'
                              }}
                              variant="outlined"
                            />
                          </Tooltip>
                        );
                      })}
                    
                    {team.members.length > 4 && (
                      <Tooltip title="他のメンバーとの関係を表示" arrow>
                        <Chip
                          label={`+${team.members.length - 4}`}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* 相互関係表（オプション） */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3">
            チームメンバー相互関係表
          </Typography>
          <Tooltip title="十神関係とは、陰陽五行の相互作用に基づいて定義される関係性です。自分の日柱干支と他の干支の関係を表します。" arrow>
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>メンバー</TableCell>
                {team.members?.map((member) => (
                  <TableCell key={member.userId} align="center">
                    {member.name ? getInitials(member.name) : '?'}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {team.members?.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>{member.name}</TableCell>
                  {team.members?.map((otherMember) => {
                    if (member.userId === otherMember.userId) {
                      return (
                        <TableCell key={otherMember.userId} align="center">
                          -
                        </TableCell>
                      );
                    }
                    
                    // 十神関係（モックデータ）
                    const tenGods = [
                      '比肩', '劫財', '食神', '傷官', '偏財',
                      '正財', '偏官', '正官', '偏印', '印綬'
                    ];
                    const randomTenGod = tenGods[Math.floor(Math.random() * tenGods.length)];
                    
                    return (
                      <TableCell key={otherMember.userId} align="center">
                        <Tooltip title={`${randomTenGod} - ${otherMember.name}に対する${member.name}の関係`} arrow>
                          <Box
                            sx={{
                              display: 'inline-block',
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: tenGodColors[randomTenGod as keyof typeof tenGodColors] + '33', // 透明度を追加
                              border: `2px solid ${tenGodColors[randomTenGod as keyof typeof tenGodColors]}`,
                              lineHeight: '28px', // borderの分を考慮
                              fontSize: '0.6rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {randomTenGod.substring(0, 1)}
                          </Box>
                        </Tooltip>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            十神関係の凡例
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(tenGodColors).map(([tenGod, color]) => (
              <Grid item key={tenGod}>
                <Chip
                  label={tenGod}
                  size="small"
                  style={{ backgroundColor: color, color: 'white' }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeamSajuView;