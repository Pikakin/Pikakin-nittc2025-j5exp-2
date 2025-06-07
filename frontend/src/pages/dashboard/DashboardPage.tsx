import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  CloudUpload as CloudUploadIcon  // 追加
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

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
        },
        {
          title: 'CSV管理',
          description: '担当者・時間割データのインポート/エクスポート',
          icon: <CloudUploadIcon sx={{ fontSize: 40 }} />,
          path: '/csv',
          color: 'warning.main'
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

        {/* ユーザー情報カード */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                {authState.user?.name?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">
                  {authState.user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {authState.user?.email}
                </Typography>
                <Chip 
                  label={getRoleLabel(authState.user?.role || '')}
                  color={authState.user?.role === 'admin' ? 'error' : 
                         authState.user?.role === 'teacher' ? 'warning' : 'info'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* メニューカード */}
        <Grid container spacing={3}>
          {getMenuItems().map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate(item.path)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ color: item.color, mb: 2 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ borderColor: item.color, color: item.color }}
                  >
                    開く
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 最近の活動（将来の拡張用） */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            最近の活動
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                最近の活動はありません
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};
