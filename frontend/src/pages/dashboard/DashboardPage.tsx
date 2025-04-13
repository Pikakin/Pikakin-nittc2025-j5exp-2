import { 
  Box, 
  Card, CardContent, CardHeader, CircularProgress, Divider, Grid, Paper, Typography 
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { requestService, scheduleService } from '../../services/scheduleService';
import { ChangeRequest, Schedule } from '../../types';

export const DashboardPage: React.FC = () => {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todaySchedules, setTodaySchedules] = useState<Schedule[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ChangeRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 今日の時間割を取得
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0: 日曜日, 1: 月曜日, ...
        
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // 平日のみ
          if (authState.user?.role === 'student') {
            // 学生の場合、自分のクラスの時間割を取得
            // 注: 実際の実装では学生のクラスIDを取得する必要があります
            const classId = 1; // 仮のクラスID
            const scheduleResponse = await scheduleService.getSchedulesByClass(classId);
            setTodaySchedules(scheduleResponse.data?.filter(s => s.dayOfWeek === dayOfWeek) || []);
          } else if (authState.user?.role === 'teacher') {
            // 教員の場合、自分の担当する時間割を取得
            // 注: 実際の実装では教員IDを取得する必要があります
            const teacherId = 1; // 仮の教員ID
            const scheduleResponse = await scheduleService.getSchedulesByTeacher(teacherId);
            setTodaySchedules(scheduleResponse.data?.filter(s => s.dayOfWeek === dayOfWeek) || []);
          } else if (authState.user?.role === 'admin') {
            // 管理者の場合、すべての時間割を取得（実際には制限が必要かもしれません）
            const scheduleResponse = await scheduleService.getSchedules({ dayOfWeek });
            setTodaySchedules(scheduleResponse.data || []);
          }
        }

        // 変更申請を取得（教員と管理者のみ）
        if (authState.user?.role === 'teacher' || authState.user?.role === 'admin') {
          const requestsResponse = await requestService.getRequests(1, 5, 'pending');
          setPendingRequests(requestsResponse.items || []);
        }

        setLoading(false);
      } catch (err: any) {
        setError('データの取得に失敗しました。');
        setLoading(false);
        console.error('Dashboard data fetch error:', err);
      }
    };

    if (authState.user) {
      fetchDashboardData();
    }
  }, [authState.user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        ダッシュボード
      </Typography>
      
      <Grid container spacing={3}>
        {/* 今日の時間割 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="今日の時間割" />
            <Divider />
            <CardContent>
              {todaySchedules.length > 0 ? (
                todaySchedules.map((schedule) => (
                  <Paper key={schedule.id} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6">
                      {schedule.period?.name}: {schedule.subject?.name}
                    </Typography>
                    <Typography variant="body2">
                      クラス: {schedule.class?.name}
                    </Typography>
                    <Typography variant="body2">
                      教室: {schedule.rooms?.map(r => r.name).join(', ')}
                    </Typography>
                    <Typography variant="body2">
                      担当: {schedule.teachers?.map(t => t.name).join(', ')}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography>今日の時間割はありません。</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 承認待ちの変更申請（教員と管理者のみ） */}
        {(authState.user?.role === 'teacher' || authState.user?.role === 'admin') && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="承認待ちの変更申請" />
              <Divider />
              <CardContent>
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => (
                    <Paper key={request.id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6">
                        {request.subject?.name}
                      </Typography>
                      <Typography variant="body2">
                        クラス: {request.class?.name}
                      </Typography>
                      <Typography variant="body2">
                        変更: {['月', '火', '水', '木', '金'][request.originalSchedule?.dayOfWeek - 1 || 0]}曜{request.originalSchedule?.period?.name} → 
                        {['月', '火', '水', '木', '金'][request.newDayOfWeek - 1]}曜{request.newPeriod?.name}
                      </Typography>
                      <Typography variant="body2">
                        理由: {request.reason}
                      </Typography>
                      <Typography variant="body2">
                        申請者: {request.requestedByUser?.name}
                      </Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography>承認待ちの変更申請はありません。</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
