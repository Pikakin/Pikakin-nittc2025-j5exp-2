import {Alert, 
  Box, Button, CircularProgress, FormControl, 
  FormHelperText, Grid,InputLabel, MenuItem,Paper, Select, Step, StepLabel, Stepper, 
  TextField, Typography 
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { masterService } from '../../services/masterService';
import { requestService, scheduleService } from '../../services/scheduleService';
import { Class, Period, Room, Schedule, Subject, Teacher } from '../../types';

export const RequestCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  // ステップ管理
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['元の授業を選択', '変更内容を入力', '確認'];
  
  // フォームデータ
  const [classId, setClassId] = useState<number | ''>('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [originalScheduleId, setOriginalScheduleId] = useState<number | ''>('');
  const [newDayOfWeek, setNewDayOfWeek] = useState<number | ''>('');
  const [newPeriodId, setNewPeriodId] = useState<number | ''>('');
  const [newRoomIds, setNewRoomIds] = useState<number[]>([]);
  const [reason, setReason] = useState('');
  
  // マスターデータ
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  
  // 選択された元の時間割
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  
  // 状態管理
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  // マスターデータの取得
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoading(true);
        
        const [classesRes, periodsRes, roomsRes] = await Promise.all([
          masterService.getClasses(),
          masterService.getPeriods(),
          masterService.getRooms()
        ]);
        
        setClasses(classesRes.data || []);
        setPeriods(periodsRes.data || []);
        setRooms(roomsRes.data || []);
        
        setLoading(false);
      } catch (err) {
        setError('マスターデータの取得に失敗しました。');
        setLoading(false);
        console.error('Master data fetch error:', err);
      }
    };

    fetchMasterData();
  }, []);
  
  // クラス選択時に科目一覧を取得
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!classId) {
        setSubjects([]);
        return;
      }
      
      try {
        setLoading(true);
        
        // 選択されたクラスの学科IDを取得
        const selectedClass = classes.find(c => c.id === classId);
        if (selectedClass && selectedClass.departmentId) {
          const response = await masterService.getSubjectsByDepartment(selectedClass.departmentId);
          setSubjects(response.data || []);
        }
        
        setLoading(false);
      } catch (err) {
        setError('科目データの取得に失敗しました。');
        setLoading(false);
        console.error('Subjects fetch error:', err);
      }
    };

    fetchSubjects();
  }, [classId, classes]);
  
  // クラスと科目選択時に時間割一覧を取得
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!classId || !subjectId) {
        setSchedules([]);
        return;
      }
      
      try {
        setLoading(true);
        
        const response = await scheduleService.getSchedules({
          classId: Number(classId),
          subjectId: Number(subjectId)
        });
        
        setSchedules(response.data || []);
        
        setLoading(false);
      } catch (err) {
        setError('時間割データの取得に失敗しました。');
        setLoading(false);
        console.error('Schedules fetch error:', err);
      }
    };

    fetchSchedules();
  }, [classId, subjectId]);
  
  // 元の時間割選択時に詳細を取得
  useEffect(() => {
    const fetchScheduleDetail = async () => {
      if (!originalScheduleId) {
        setSelectedSchedule(null);
        return;
      }
      
      try {
        setLoading(true);
        
        const response = await scheduleService.getScheduleById(Number(originalScheduleId));
        setSelectedSchedule(response.data || null);
        
        setLoading(false);
      } catch (err) {
        setError('時間割詳細の取得に失敗しました。');
        setLoading(false);
        console.error('Schedule detail fetch error:', err);
      }
    };

    fetchScheduleDetail();
  }, [originalScheduleId]);
  
  // フォームバリデーション
  const validateStep = (step: number) => {
    const errors: { [key: string]: string } = {};
    
    if (step === 0) {
      if (!classId) errors.classId = 'クラスを選択してください';
      if (!subjectId) errors.subjectId = '科目を選択してください';
      if (!originalScheduleId) errors.originalScheduleId = '元の時間割を選択してください';
    } else if (step === 1) {
      if (!newDayOfWeek) errors.newDayOfWeek = '変更後の曜日を選択してください';
      if (!newPeriodId) errors.newPeriodId = '変更後の時限を選択してください';
      if (newRoomIds.length === 0) errors.newRoomIds = '変更後の教室を選択してください';
      if (!reason.trim()) errors.reason = '変更理由を入力してください';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 次のステップへ
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // 前のステップへ
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // 申請を送信
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      const requestData = {
        originalScheduleId: Number(originalScheduleId),
        newDayOfWeek: Number(newDayOfWeek),
        newPeriodId: Number(newPeriodId),
        newRoomIds: newRoomIds,
        reason
      };
      
      await requestService.createRequest(requestData);
      
      setSubmitting(false);
      navigate('/requests', { state: { success: true } });
    } catch (err: any) {
      setError(err.message || '申請の送信に失敗しました。');
      setSubmitting(false);
      console.error('Submit error:', err);
    }
  };
  
  // 曜日の日本語表示
  const getDayOfWeekLabel = (dayOfWeek: number) => {
    const days = ['月', '火', '水', '木', '金'];
    return days[dayOfWeek - 1] || '';
  };
  
  // ステップ1: 元の授業選択フォーム
  const renderStep1 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!formErrors.classId}>
          <InputLabel id="class-select-label">クラス</InputLabel>
          <Select
            labelId="class-select-label"
            id="class-select"
            value={classId}
            label="クラス"
            onChange={(e) => setClassId(e.target.value as number)}
            disabled={loading}
          >
            <MenuItem value="">
              <em>選択してください</em>
            </MenuItem>
            {classes.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.name}
              </MenuItem>
            ))}
          </Select>
          {formErrors.classId && <FormHelperText>{formErrors.classId}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!formErrors.subjectId} disabled={!classId || loading}>
          <InputLabel id="subject-select-label">科目</InputLabel>
          <Select
            labelId="subject-select-label"
            id="subject-select"
            value={subjectId}
            label="科目"
            onChange={(e) => setSubjectId(e.target.value as number)}
          >
            <MenuItem value="">
              <em>選択してください</em>
            </MenuItem>
            {subjects.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                {subject.name}
              </MenuItem>
            ))}
          </Select>
          {formErrors.subjectId && <FormHelperText>{formErrors.subjectId}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth error={!!formErrors.originalScheduleId} disabled={!subjectId || loading}>
          <InputLabel id="schedule-select-label">元の時間割</InputLabel>
          <Select
            labelId="schedule-select-label"
            id="schedule-select"
            value={originalScheduleId}
            label="元の時間割"
            onChange={(e) => setOriginalScheduleId(e.target.value as number)}
          >
            <MenuItem value="">
              <em>選択してください</em>
            </MenuItem>
            {schedules.map((schedule) => (
              <MenuItem key={schedule.id} value={schedule.id}>
                {getDayOfWeekLabel(schedule.dayOfWeek)}曜日 {schedule.period?.name} 
                （教室: {schedule.rooms?.map(r => r.name).join(', ') || '未設定'}）
              </MenuItem>
            ))}
          </Select>
          {formErrors.originalScheduleId && <FormHelperText>{formErrors.originalScheduleId}</FormHelperText>}
        </FormControl>
      </Grid>
      
      {selectedSchedule && (
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>選択した授業の詳細</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">科目</Typography>
                <Typography>{selectedSchedule.subject?.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">クラス</Typography>
                <Typography>{selectedSchedule.class?.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">曜日・時限</Typography>
                <Typography>
                  {getDayOfWeekLabel(selectedSchedule.dayOfWeek)}曜日 {selectedSchedule.period?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">教室</Typography>
                <Typography>
                  {selectedSchedule.rooms?.map(r => r.name).join(', ') || '未設定'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">担当教員</Typography>
                <Typography>
                  {selectedSchedule.teachers?.map(t => t.name).join(', ') || '未設定'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
  
  // ステップ2: 変更内容入力フォーム
  const renderStep2 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!formErrors.newDayOfWeek}>
          <InputLabel id="day-select-label">変更後の曜日</InputLabel>
          <Select
            labelId="day-select-label"
            id="day-select"
            value={newDayOfWeek}
            label="変更後の曜日"
            onChange={(e) => setNewDayOfWeek(e.target.value as number)}
            disabled={loading}
          >
            <MenuItem value="">
              <em>選択してください</em>
            </MenuItem>
            {[1, 2, 3, 4, 5].map((day) => (
              <MenuItem key={day} value={day}>
                {getDayOfWeekLabel(day)}曜日
              </MenuItem>
            ))}
          </Select>
          {formErrors.newDayOfWeek && <FormHelperText>{formErrors.newDayOfWeek}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!formErrors.newPeriodId}>
          <InputLabel id="period-select-label">変更後の時限</InputLabel>
          <Select
            labelId="period-select-label"
            id="period-select"
            value={newPeriodId}
            label="変更後の時限"
            onChange={(e) => setNewPeriodId(e.target.value as number)}
            disabled={loading}
          >
            <MenuItem value="">
              <em>選択してください</em>
            </MenuItem>
            {periods.map((period) => (
              <MenuItem key={period.id} value={period.id}>
                {period.name} ({period.startTime}-{period.endTime})
              </MenuItem>
            ))}
          </Select>
          {formErrors.newPeriodId && <FormHelperText>{formErrors.newPeriodId}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth error={!!formErrors.newRoomIds}>
          <InputLabel id="room-select-label">変更後の教室</InputLabel>
          <Select
            labelId="room-select-label"
            id="room-select"
            multiple
            value={newRoomIds}
            label="変更後の教室"
            onChange={(e) => setNewRoomIds(e.target.value as number[])}
            disabled={loading}
          >
            {rooms.map((room) => (
              <MenuItem key={room.id} value={room.id}>
                {room.name} (定員: {room.capacity}名)
              </MenuItem>
            ))}
          </Select>
          {formErrors.newRoomIds && <FormHelperText>{formErrors.newRoomIds}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          id="reason"
          label="変更理由"
          multiline
          rows={4}
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={!!formErrors.reason}
          helperText={formErrors.reason || '変更理由を具体的に記入してください。'}
          disabled={loading}
        />
      </Grid>
    </Grid>
  );
  
  // ステップ3: 確認画面
  const renderStep3 = () => {
    if (!selectedSchedule) return null;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 3 }}>
            以下の内容で変更申請を送信します。内容をご確認ください。
          </Alert>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>元の授業情報</Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">科目</Typography>
                <Typography>{selectedSchedule.subject?.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">クラス</Typography>
                <Typography>{selectedSchedule.class?.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">曜日・時限</Typography>
                <Typography>
                  {getDayOfWeekLabel(selectedSchedule.dayOfWeek)}曜日 {selectedSchedule.period?.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">教室</Typography>
                <Typography>
                  {selectedSchedule.rooms?.map(r => r.name).join(', ') || '未設定'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>変更後の情報</Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">科目</Typography>
                <Typography>{selectedSchedule.subject?.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">クラス</Typography>
                <Typography>{selectedSchedule.class?.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">曜日・時限</Typography>
                <Typography>
                  {getDayOfWeekLabel(Number(newDayOfWeek))}曜日 {
                    periods.find(p => p.id === newPeriodId)?.name
                  }
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">教室</Typography>
                <Typography>
                  {newRoomIds.map(id => rooms.find(r => r.id === id)?.name).join(', ') || '未設定'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>変更理由</Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography>{reason}</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  // ステップに応じたコンテンツを表示
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        時間割変更申請
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={activeStep === 0 ? () => navigate('/requests') : handleBack}
                disabled={submitting}
              >
                {activeStep === 0 ? 'キャンセル' : '戻る'}
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? '送信中...' : '申請を送信'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={loading}
                >
                  次へ
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};
