import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon
} from '@mui/icons-material';
import {Alert, Autocomplete,
  Box, Button, 
  Chip, CircularProgress, Divider, 
  FormControl, FormHelperText, Grid, InputLabel, MenuItem,Paper, Select, TextField, Typography 
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { masterService } from '../../services/masterService';
import { requestService } from '../../services/requestService';
import { scheduleService } from '../../services/scheduleService';
import { Period, Room, Schedule } from '../../types';

export const RequestCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  // フォームの状態
  const [originalScheduleId, setOriginalScheduleId] = useState<number | null>(null);
  const [newDayOfWeek, setNewDayOfWeek] = useState<number | null>(null);
  const [newPeriodId, setNewPeriodId] = useState<number | null>(null);
  const [newRoomIds, setNewRoomIds] = useState<number[]>([]);
  const [reason, setReason] = useState('');
  
  // マスターデータ
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  
  // 状態管理
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // バリデーション
  const [errors, setErrors] = useState<{
    originalScheduleId?: string;
    newDayOfWeek?: string;
    newPeriodId?: string;
    newRoomIds?: string;
    reason?: string;
  }>({});
  
  // 初期表示時にマスターデータを取得
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 教員の担当授業を取得
        let scheduleResponse;
        if (authState.user?.role === 'admin') {
          scheduleResponse = await scheduleService.getSchedules();
        } else {
          // 教員IDを取得（実際のAPIに合わせて調整が必要）
          const teacherId = authState.user?.id;
          scheduleResponse = await scheduleService.getTeacherSchedule(teacherId!);
        }
        
        // 時限と教室を取得
        const [periodsResponse, roomsResponse] = await Promise.all([
          masterService.getPeriods(),
          masterService.getRooms()
        ]);
        
        setSchedules(scheduleResponse.data);
        setPeriods(periodsResponse.data);
        setRooms(roomsResponse.data);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'マスターデータの取得に失敗しました。');
        setLoading(false);
      }
    };
    
    fetchMasterData();
  }, [authState.user]);
  
  // 時間割選択時の処理
  const handleScheduleChange = (schedule: Schedule | null) => {
    setSelectedSchedule(schedule);
    setOriginalScheduleId(schedule?.id || null);
    
    // 選択された時間割の曜日・時限を初期値として設定
    if (schedule) {
      setNewDayOfWeek(schedule.dayOfWeek);
      setNewPeriodId(schedule.periodId);
      
      // 選択された時間割の教室を初期値として設定
      if (schedule.rooms && schedule.rooms.length > 0) {
        setNewRoomIds(schedule.rooms.map(room => room.id));
      } else {
        setNewRoomIds([]);
      }
    } else {
      setNewDayOfWeek(null);
      setNewPeriodId(null);
      setNewRoomIds([]);
    }
    
    // エラーをクリア
    setErrors(prev => ({ ...prev, originalScheduleId: undefined }));
  };
  
  // バリデーション
  const validateForm = () => {
    const newErrors: {
      originalScheduleId?: string;
      newDayOfWeek?: string;
      newPeriodId?: string;
      newRoomIds?: string;
      reason?: string;
    } = {};
    
    if (!originalScheduleId) {
      newErrors.originalScheduleId = '変更対象の時間割を選択してください';
    }
    
    if (!newDayOfWeek) {
      newErrors.newDayOfWeek = '変更後の曜日を選択してください';
    }
    
    if (!newPeriodId) {
      newErrors.newPeriodId = '変更後の時限を選択してください';
    }
    
    if (newRoomIds.length === 0) {
      newErrors.newRoomIds = '変更後の教室を選択してください';
    }
    
    if (!reason.trim()) {
      newErrors.reason = '変更理由を入力してください';
    } else if (reason.length < 10) {
      newErrors.reason = '変更理由は10文字以上で入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 申請送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      await requestService.createRequest({
        originalScheduleId: originalScheduleId!,
        newDayOfWeek: newDayOfWeek!,
        newPeriodId: newPeriodId!,
        newRoomIds: newRoomIds,
        reason
      });
      
      // 申請一覧ページに遷移
      navigate('/requests', { state: { success: true } });
    } catch (err: any) {
      setError(err.message || '申請の送信に失敗しました。');
      setSubmitting(false);
    }
  };
  
  // 曜日の選択肢
  const dayOfWeekOptions = [
    { value: 1, label: '月曜日' },
    { value: 2, label: '火曜日' },
    { value: 3, label: '水曜日' },
    { value: 4, label: '木曜日' },
    { value: 5, label: '金曜日' },
  ];
  
  // 時間割表示用のフォーマット
  const formatSchedule = (schedule: Schedule) => {
    const dayLabel = dayOfWeekOptions.find(d => d.value === schedule.dayOfWeek)?.label || '';
    const periodName = schedule.period?.name || '';
    const subjectName = schedule.subject?.name || '';
    const className = schedule.class?.name || '';
    
    return `${subjectName} (${className}) - ${dayLabel} ${periodName}`;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/requests')}
        sx={{ mb: 2 }}
      >
        一覧に戻る
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom>
        時間割変更申請
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                変更対象の時間割
              </Typography>
              <Autocomplete
                id="originalSchedule"
                options={schedules}
                getOptionLabel={(option) => formatSchedule(option)}
                value={selectedSchedule}
                onChange={(_, newValue) => handleScheduleChange(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="変更対象の時間割を選択"
                    error={!!errors.originalScheduleId}
                    helperText={errors.originalScheduleId}
                    required
                  />
                )}
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                変更後の情報
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.newDayOfWeek} required>
                <InputLabel id="newDayOfWeek-label">曜日</InputLabel>
                <Select
                  labelId="newDayOfWeek-label"
                  id="newDayOfWeek"
                  value={newDayOfWeek || ''}
                  label="曜日"
                  onChange={(e) => {
                    setNewDayOfWeek(e.target.value as number);
                    setErrors(prev => ({ ...prev, newDayOfWeek: undefined }));
                  }}
                  disabled={submitting}
                >
                  {dayOfWeekOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.newDayOfWeek && (
                  <FormHelperText>{errors.newDayOfWeek}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.newPeriodId} required>
                <InputLabel id="newPeriodId-label">時限</InputLabel>
                <Select
                  labelId="newPeriodId-label"
                  id="newPeriodId"
                  value={newPeriodId || ''}
                  label="時限"
                  onChange={(e) => {
                    setNewPeriodId(e.target.value as number);
                    setErrors(prev => ({ ...prev, newPeriodId: undefined }));
                  }}
                  disabled={submitting}
                >
                  {periods.map((period) => (
                    <MenuItem key={period.id} value={period.id}>
                      {period.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.newPeriodId && (
                  <FormHelperText>{errors.newPeriodId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                id="newRooms"
                options={rooms}
                getOptionLabel={(option) => option.name}
                value={rooms.filter(room => newRoomIds.includes(room.id))}
                onChange={(_, newValue) => {
                  setNewRoomIds(newValue.map(room => room.id));
                  setErrors(prev => ({ ...prev, newRoomIds: undefined }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="教室"
                    placeholder="教室を選択"
                    error={!!errors.newRoomIds}
                    helperText={errors.newRoomIds}
                    required
                  />
                )}
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                id="reason"
                label="変更理由"
                multiline
                rows={4}
                fullWidth
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setErrors(prev => ({ ...prev, reason: undefined }));
                }}
                error={!!errors.reason}
                helperText={errors.reason}
                required
                disabled={submitting}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/requests')}
                  sx={{ mr: 2 }}
                  disabled={submitting}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={submitting ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                  disabled={submitting}
                >
                  申請を送信
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};
