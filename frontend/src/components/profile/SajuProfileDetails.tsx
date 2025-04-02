import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import userService from '../../services/user.service';
import { ISajuProfile, IUser } from '../../types';

// 五行属性のカラー定義
const elementColors = {
  '木': '#4CAF50', // 緑
  '火': '#F44336', // 赤
  '土': '#FFC107', // 黄
  '金': '#9E9E9E', // 灰色
  '水': '#2196F3', // 青
};

// 十神関係の色を返す関数
const getTenGodColor = (tenGod?: string): "primary" | "secondary" | "success" | "error" | "info" | "warning" | undefined => {
  if (!tenGod) return undefined;
  
  // 十神の種類によって色を分類
  switch (tenGod) {
    case '比肩':
    case '劫財':
      return 'primary';  // 青系 - 自分と同じ気質の影響力
    
    case '食神':
    case '傷官':
      return 'success';  // 緑系 - 創造性や表現力
    
    case '偏財':
    case '正財':
      return 'warning';  // 黄系 - 財運、物質的な恩恵
    
    case '偏官':
    case '正官':
      return 'error';    // 赤系 - 権力、影響力
    
    case '偏印':
    case '正印':
      return 'info';     // 水色系 - 知性、学習
    
    default:
      return undefined;
  }
};

interface SajuProfileDetailsProps {
  user: IUser;
}

const SajuProfileDetails: React.FC<SajuProfileDetailsProps> = ({ user }) => {
  const [sajuProfile, setSajuProfile] = useState<ISajuProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSajuProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ユーザーオブジェクトにすでにサジュプロファイルがある場合はそれを使用
        if (user.sajuProfile) {
          setSajuProfile(user.sajuProfile);
          setLoading(false);
          return;
        }
        
        // APIから四柱推命プロファイルを取得
        const profileData = await userService.getSajuProfile();
        setSajuProfile(profileData);
      } catch (err) {
        console.error('四柱推命プロファイル取得エラー:', err);
        setError('四柱推命プロファイルの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchSajuProfile();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
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

  if (!sajuProfile || !sajuProfile.fourPillars) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          四柱推命プロファイルが設定されていません。基本情報タブで生年月日と出生時間を設定してください。
        </Alert>
        
        <Typography variant="body1" paragraph>
          四柱推命プロファイルを表示するためには、以下の情報が必要です：
        </Typography>
        
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" variant="body1" paragraph>
            <strong>生年月日</strong>：必須項目です
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            <strong>出生時間</strong>：できるだけ正確な時間を入力してください（時柱の計算に必要）
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            <strong>出生地</strong>：より正確な計算のために、出生地も入力することをおすすめします
          </Typography>
        </Box>
        
        <Typography variant="body1">
          これらの情報を「基本情報」タブで設定すると、四柱推命に基づいた詳細なプロファイル情報が表示されます。プロファイル情報には、あなたの五行属性、四柱（年柱・月柱・日柱・時柱）、隠れ天干（蔵干）、十神関係などが含まれます。
        </Typography>
      </Box>
    );
  }

  const { fourPillars, mainElement, yinYang, tenGods, branchTenGods } = sajuProfile;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        四柱推命プロファイル
      </Typography>
      
      {/* 基本情報 */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="bold">
                五行属性
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: elementColors[mainElement as keyof typeof elementColors] || '#999',
                    mr: 1
                  }}
                />
                <Typography variant="h6">
                  {mainElement}の{yinYang}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" fontWeight="bold">
                性格特性
              </Typography>
              <Typography variant="body1" mt={1}>
                {mainElement === '木' && yinYang === '陽' && '創造性に富み、成長を好みます。目標に向かって進む力があります。'}
                {mainElement === '木' && yinYang === '陰' && '柔軟でしなやか、適応力があります。忍耐強く地道な努力ができます。'}
                {mainElement === '火' && yinYang === '陽' && '情熱的で活動的、人を引きつける魅力があります。'}
                {mainElement === '火' && yinYang === '陰' && '穏やかな温かさがあり、人間関係を大切にします。'}
                {mainElement === '土' && yinYang === '陽' && '安定感があり、信頼できる存在です。組織をまとめる力があります。'}
                {mainElement === '土' && yinYang === '陰' && '思慮深く、支援的な性格です。周囲への気配りができます。'}
                {mainElement === '金' && yinYang === '陽' && '決断力があり、鋭い判断ができます。目標達成のための実行力があります。'}
                {mainElement === '金' && yinYang === '陰' && '繊細で美的センスがあります。細部への配慮ができます。'}
                {mainElement === '水' && yinYang === '陽' && '知性に富み、好奇心が旺盛です。新しいアイデアを生み出す力があります。'}
                {mainElement === '水' && yinYang === '陰' && '直観力が高く、深い洞察力があります。静かに物事を見極める力があります。'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* 四柱（干支）情報 */}
      <Typography variant="h6" gutterBottom>
        四柱（干支）情報
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'background.default' }}>
              <TableCell>柱</TableCell>
              <TableCell>天干</TableCell>
              <TableCell>地支</TableCell>
              <TableCell>干支</TableCell>
              <TableCell>隠れ天干（蔵干）</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>年柱</TableCell>
              <TableCell>{fourPillars.yearPillar?.stem}</TableCell>
              <TableCell>{fourPillars.yearPillar?.branch}</TableCell>
              <TableCell>{fourPillars.yearPillar?.fullStemBranch}</TableCell>
              <TableCell>
                {fourPillars.yearPillar?.hiddenStems?.join(', ') || '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>月柱</TableCell>
              <TableCell>{fourPillars.monthPillar?.stem}</TableCell>
              <TableCell>{fourPillars.monthPillar?.branch}</TableCell>
              <TableCell>{fourPillars.monthPillar?.fullStemBranch}</TableCell>
              <TableCell>
                {fourPillars.monthPillar?.hiddenStems?.join(', ') || '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>日柱</TableCell>
              <TableCell>{fourPillars.dayPillar?.stem}</TableCell>
              <TableCell>{fourPillars.dayPillar?.branch}</TableCell>
              <TableCell>{fourPillars.dayPillar?.fullStemBranch}</TableCell>
              <TableCell>
                {fourPillars.dayPillar?.hiddenStems?.join(', ') || '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>時柱</TableCell>
              <TableCell>{fourPillars.hourPillar?.stem}</TableCell>
              <TableCell>{fourPillars.hourPillar?.branch}</TableCell>
              <TableCell>{fourPillars.hourPillar?.fullStemBranch}</TableCell>
              <TableCell>
                {fourPillars.hourPillar?.hiddenStems?.join(', ') || '-'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* 十神関係 */}
      {tenGods && Object.keys(tenGods).length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            十神関係
          </Typography>
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              {/* 十神関係の説明 */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  十神関係とは、日主（日柱の天干）から見た各柱の相対的関係性を表します。
                  これにより、あなたの性格特性や対人関係における強み・弱みを読み解くことができます。
                </Typography>
              </Box>

              {/* 十神関係の表示 - より視覚的に */}
              <Box sx={{ mb: 4 }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'primary.light' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>柱</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>天干</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>十神関係</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>地支</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>十神関係</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* 年柱 */}
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                          年柱
                        </TableCell>
                        <TableCell>
                          {fourPillars.yearPillar?.stem}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={tenGods['year'] || '-'} 
                            color={getTenGodColor(tenGods['year'])}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          {fourPillars.yearPillar?.branch}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={branchTenGods?.year || '-'} 
                            color={getTenGodColor(branchTenGods?.year)}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>

                      {/* 月柱 */}
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                          月柱
                        </TableCell>
                        <TableCell>
                          {fourPillars.monthPillar?.stem}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={tenGods['month'] || '-'} 
                            color={getTenGodColor(tenGods['month'])}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          {fourPillars.monthPillar?.branch}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={branchTenGods?.month || '-'} 
                            color={getTenGodColor(branchTenGods?.month)} 
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>

                      {/* 日柱 */}
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                          日柱
                        </TableCell>
                        <TableCell>
                          {fourPillars.dayPillar?.stem}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={tenGods['day'] || '-'} 
                            color={getTenGodColor(tenGods['day'])}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          {fourPillars.dayPillar?.branch}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={branchTenGods?.day || '-'} 
                            color={getTenGodColor(branchTenGods?.day)}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>

                      {/* 時柱 */}
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                          時柱
                        </TableCell>
                        <TableCell>
                          {fourPillars.hourPillar?.stem}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={tenGods['hour'] || '-'} 
                            color={getTenGodColor(tenGods['hour'])}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          {fourPillars.hourPillar?.branch}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={branchTenGods?.hour || '-'} 
                            color={getTenGodColor(branchTenGods?.hour)}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* 十神の意味解説 */}
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                十神の意味
              </Typography>
              <Grid container spacing={2}>
                {[
                  { name: '比肩', description: '同じタイプの仲間、協力者', color: 'primary' },
                  { name: '劫財', description: '競争相手、ライバル', color: 'primary' },
                  { name: '食神', description: '楽しみ、創造性、子供', color: 'success' },
                  { name: '傷官', description: '表現力、芸術性、反抗', color: 'success' },
                  { name: '偏財', description: '臨時収入、事業利益', color: 'warning' },
                  { name: '正財', description: '安定収入、給与', color: 'warning' },
                  { name: '偏官', description: '権力、カリスマ性', color: 'error' },
                  { name: '正官', description: '規律、秩序、名誉', color: 'error' },
                  { name: '偏印', description: '学識、直観、思想', color: 'info' },
                  { name: '正印', description: '知恵、学問、母親', color: 'info' }
                ].map((god, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 1, 
                        border: 1, 
                        borderColor: `${god.color}.main`,
                        backgroundColor: `${god.color}.lighter`,
                        height: '100%'
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" color={`${god.color}.dark`}>
                        {god.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {god.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* 適性と役割 */}
      <Typography variant="h6" gutterBottom>
        適性と役割
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                強み
              </Typography>
              <Box mt={1}>
                {mainElement === '木' && (
                  <>
                    <Typography variant="body2" paragraph>
                      • 創造的思考と成長志向
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • 戦略的計画立案
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • 新しいプロジェクトの立ち上げ
                    </Typography>
                  </>
                )}
                {mainElement === '火' && (
                  <>
                    <Typography variant="body2" paragraph>
                      • コミュニケーションとプレゼンテーション
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • マーケティングと広報
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • チームの活性化とモチベーション向上
                    </Typography>
                  </>
                )}
                {mainElement === '土' && (
                  <>
                    <Typography variant="body2" paragraph>
                      • 安定したリーダーシップ
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • チームビルディングと調整
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • サポートと信頼関係構築
                    </Typography>
                  </>
                )}
                {mainElement === '金' && (
                  <>
                    <Typography variant="body2" paragraph>
                      • 精密な分析と判断
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • 効率化と最適化
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • 品質管理と完成度の追求
                    </Typography>
                  </>
                )}
                {mainElement === '水' && (
                  <>
                    <Typography variant="body2" paragraph>
                      • 情報収集と分析
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • イノベーションと問題解決
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • 洞察力と直観的判断
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                適した役割
              </Typography>
              <Box mt={1}>
                {mainElement === '木' && (
                  <>
                    <Typography variant="body2" paragraph>
                      • プロジェクトマネージャー
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • 事業開発担当
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • 企画・戦略部門
                    </Typography>
                  </>
                )}
                {mainElement === '火' && (
                  <>
                    <Typography variant="body2" paragraph>
                      • マーケティング担当
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • 営業・広報担当
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • トレーナー・コーチ
                    </Typography>
                  </>
                )}
                {mainElement === '土' && (
                  <>
                    <Typography variant="body2" paragraph>
                      • チームリーダー
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • 人事・総務担当
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • カスタマーサポート
                    </Typography>
                  </>
                )}
                {mainElement === '金' && (
                  <>
                    <Typography variant="body2" paragraph>
                      • 品質管理担当
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • 財務・経理担当
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • デザイナー・エンジニア
                    </Typography>
                  </>
                )}
                {mainElement === '水' && (
                  <>
                    <Typography variant="body2" paragraph>
                      • リサーチャー・アナリスト
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • システム設計・開発
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • コンサルタント
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SajuProfileDetails;