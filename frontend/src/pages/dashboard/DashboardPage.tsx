import {
  ArrowForward as ArrowForwardIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import {Alert, 
  Box, Button, Card, 
  CardActions, CardContent,Chip, CircularProgress, Divider, Grid, List,
  ListItem, ListItemIcon, ListItemText, Paper, Typography 
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScheduleTable } from '../../components/schedule/ScheduleTable';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/requestService';
import { scheduleService } from '../../services/scheduleService';
import { ChangeRequest, Schedule } from '../../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;
  
  // 状態管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // データ
  const [pendingRequests, setPendingRequests] = useState<ChangeRequest[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [weekSchedules, setWeekSchedules] = useState<Schedule[]>([]);
  
  // 現在の曜日（1: 月曜日, 2: 火曜日, ...）
  const today = new Date().getDay();
  const currentDayOfWeek = today === 0 ? 5 : today === 6 ? 5 : today;
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 並行してデータを取得
        const promises = [];
        
        // 管理者の場合は審査中の申請を取得
        if (user?.role === 'admin') {
          promises.push(
            requestService.getRequests(1, 5, 'pending')
              .then(response => setPendingRequests(response.items))
          );
        } 
        // 教員の場合は自分の申請を取得
        else if (user?.role === 'teacher') {
          promises.push(
            requestService.getMyRequests(1, 5)
              .then(response => setPendingRequests(response.items))
          );
        }
        
        // 教員の場合は担当授業を取得
        if (user?.role === 'teacher') {
          promises.push(
            scheduleService.getTeacherSchedule(user.id)
              .then(response => {
                const schedules = response.data;
                // 今日の時間割
                const todaySchedules = schedules.filter(s => s.dayOfWeek === currentDayOfWeek);
                setTodaySchedules(todaySchedules);
                // 週間時間割
                setWeekSchedules(schedules);
              })
          );
        }
        // 学生の場合はクラスの時間割を取得
        else if (user?.role === 'student' && user.classId) {
          promises.push(
            scheduleService.getClassSchedule(user.classId)
              .then(response => {
                const schedules = response.data;
                // 今日の時間割
                const todaySchedules = schedules.filter(s => s.dayOfWeek === currentDayOfWeek);
                setTodaySchedules(todaySchedules);
                // 週間時間割
                setWeekSchedules(schedules);
              })
          );
        }
        
        await Promise.all(promises);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'データの取得に失敗しました。');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // 曜日の日本語表示
  const getDayOfWeekLabel = (dayOfWeek: number) => {
    const days = ['月', '火', '水', '木', '金'];
    return days[dayOfWeek - 1] || '';
  };
  
  // 申請ステータスに応じたチップを表示
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="審査中" color="warning" size="small" />;
      case 'approved':
        return <Chip label="承認済" color="success" size="small" />;
      case 'rejected':
        return <Chip label="却下" color="error" size="small" />;
      default:
        return <Chip label="不明" size="small" />;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        ダッシュボード
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* ユーザー情報カード */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ユーザー情報
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                氏名: {user?.name}
              </Typography>
              <Typography variant="body1">
                ユーザーID: {user?.username}
              </Typography>
              <Typography variant="body1">
                役割: {
                  user?.role === 'admin' ? '管理者' :
                  user?.role === 'teacher' ? '教員' :
                  user?.role === 'student' ? '学生' : '不明'
                }
              </Typography>
              {user?.role === 'student' && (
                <Typography variant="body1">
                  クラス: {user?.class?.name || '未設定'}
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/profile')}>
                プロフィール詳細
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* 変更申請カード（管理者と教員のみ） */}
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">
                    <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    変更申請
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/requests')}
                  >
                    すべて表示
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {pendingRequests.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    {user?.role === 'admin' ? '審査中の申請はありません' : '申請はありません'}
                  </Typography>
                ) : (
                  <List>
                    {pendingRequests.map((request) => (
                      <ListItem
                        key={request.id}
                        secondaryAction={
                          <Button
                            size="small"
                            onClick={() => navigate(`/requests/${request.id}`)}
                          >
                            詳細
                          </Button>
                        }
                        sx={{ borderBottom: '1px solid #eee' }}
                      >
                        <ListItemIcon>
                          {request.status === 'pending' ? (
                            <EditIcon color="warning" />
                          ) : request.status === 'approved' ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <CancelIcon color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${request.originalSchedule?.subject?.name || '不明'} - ${getDayOfWeekLabel(request.originalSchedule?.dayOfWeek || 0)}曜${request.originalSchedule?.period?.name || ''} → ${getDayOfWeekLabel(request.newDayOfWeek)}曜${request.newPeriod?.name || ''}`}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getStatusChip(request.status)}
                              <Typography variant="body2" component="span">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
              {user?.role === 'teacher' && (
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate('/requests/create')}
                  >
                    新規申請
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        )}
        
        {/* 今日の時間割カード */}
        {(user?.role === 'teacher' || user?.role === 'student') && (
          <Grid item xs={12} md={user?.role === 'student' ? 6 : 6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  今日の時間割 ({getDayOfWeekLabel(currentDayOfWeek)}曜日)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {todaySchedules.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    今日の授業はありません
                  </Typography>
                ) : (
                  <List>
                    {todaySchedules
                      .sort((a, b) => (a.periodId || 0) - (b.periodId || 0))
                      .map((schedule) => (
                        <ListItem key={schedule.id} sx={{ borderBottom: '1px solid #eee' }}>
                          <ListItemIcon>
                            <ScheduleIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${schedule.period?.name || ''}: ${schedule.subject?.name || '不明'}`}
                            secondary={`教室: ${schedule.rooms?.map(r => r.name).join(', ') || '未設定'}`}
                          />
                        </ListItem>
                      ))}
                  </List>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate('/schedules')}
                >
                  時間割表示
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}
        
        {/* 週間時間割カード */}
        {(user?.role === 'teacher' || user?.role === 'student') && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                週間時間割
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {weekSchedules.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  時間割データがありません
                </Typography>
              ) : (
                <ScheduleTable schedules={weekSchedules} />
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
