import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者';
      case 'teacher':
        return '教員';
      case 'student':
        return '学生';
      default:
        return role;
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      {
        title: '時間割表示',
        description: '現在の時間割を確認できます',
        icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
        path: '/schedules',
        color: 'primary.main'
      }
    ];

    if (authState.user?.role === 'admin') {
      return [
        ...baseItems,
        {
          title: '申請管理',
          description: '時間割変更申請の承認・管理',
          icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
          path: '/requests',
          color: 'secondary.main'
        },
        {
          title: 'ユーザー管理',
          description: 'システムユーザーの管理',
          icon: <PeopleIcon sx={{ fontSize: 40 }} />,
          path: '/users',
          color: 'success.main'
        }
      ];
    }

    if (authState.user?.role === 'teacher') {
      return [
        ...baseItems,
        {
          title: '変更申請',
          description: '時間割変更の申請を作成',
          icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
          path: '/requests/create',
          color: 'secondary.main'
        },
        {
          title: '申請履歴',
          description: '過去の申請履歴を確認',
          icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
          path: '/requests',
          color: 'warning.main'
        }
      ];
    }

    return baseItems;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* ヘッダー */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            ダッシュボード
          </Typography>
          <Typography variant="h6" color="text.secondary">
            ようこそ、{authState.user?.name}さん ({getRoleLabel(authState.user?.role || '')})
          </Typography>
        </Box>

        {/* 統計情報 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
                25
              </Typography>
              <Typography variant="body2" color="text.secondary">
                今週の授業数
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main" sx={{ mb: 1 }}>
                3
              </Typography>
              <Typography variant="body2" color="text.secondary">
                未処理の申請
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ mb: 1 }}>
                12
              </Typography>
              <Typography variant="body2" color="text.secondary">
                今月の変更件数
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ mb: 1 }}>
                2
              </Typography>
              <Typography variant="body2" color="text.secondary">
                新着通知
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* メニューカード */}
        <Grid container spacing={3}>
          {getMenuItems().map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 3 }}>
                  <Box sx={{ color: item.color, mb: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(item.path)}
                    sx={{ bgcolor: item.color }}
                  >
                    開く
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};
