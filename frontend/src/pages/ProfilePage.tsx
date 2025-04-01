import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Tabs, Tab, CircularProgress } from '@mui/material';
import { useUser } from '../contexts/UserContext';
import ProfileForm from '../components/profile/ProfileForm';
import NotificationSettings from '../components/profile/NotificationSettings';
import AIPersonalization from '../components/profile/AIPersonalization';
import SajuProfileDetails from '../components/profile/SajuProfileDetails';

// タブコンテンツのインターフェース
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// タブパネルコンポーネント
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

// アクセシビリティのためのProps生成関数
const a11yProps = (index: number) => {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
};

// プロフィールページコンポーネント
const ProfilePage: React.FC = () => {
  const { user, loading, error } = useUser();
  const [tabValue, setTabValue] = useState(0);

  // タブの変更ハンドラー
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  // ローディング中表示
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // エラー表示
  if (error) {
    return (
      <Container maxWidth="md">
        <Box mt={4} textAlign="center">
          <Typography variant="h5" color="error">
            {error}
          </Typography>
          <Typography variant="body1" mt={2}>
            ページを再読み込みするか、後ほど再度お試しください。
          </Typography>
        </Box>
      </Container>
    );
  }

  // ユーザーがログインしていない場合
  if (!user) {
    return (
      <Container maxWidth="md">
        <Box mt={4} textAlign="center">
          <Typography variant="h5">
            プロフィール情報を表示するにはログインしてください。
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mt={4} mb={6}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          マイプロフィール設定
        </Typography>

        <Paper elevation={3} sx={{ mt: 4, borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="プロフィール設定タブ"
            centered
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                py: 2,
              },
            }}
          >
            <Tab label="基本情報" {...a11yProps(0)} />
            <Tab label="四柱推命" {...a11yProps(1)} />
            <Tab label="通知設定" {...a11yProps(2)} />
            <Tab label="AIパーソナライズ" {...a11yProps(3)} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <ProfileForm user={user} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <SajuProfileDetails user={user} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <NotificationSettings 
              notificationSettings={user.notificationSettings} 
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <AIPersonalization />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;