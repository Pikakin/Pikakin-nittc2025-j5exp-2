import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { 
  Box, Button, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Paper, Select, 
  SelectChangeEvent, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography 
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { masterService } from '../../services/masterService';
import { scheduleService } from '../../services/scheduleService';
import { Class, Period, Room, Schedule, Teacher } from '../../types';

export const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // マスターデータの取得
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoading(true);
        
        const [classesRes, teachersRes, roomsRes, periodsRes] = await Promise.all([
          masterService.getClasses(),
          masterService.getTeachers(),
          masterService.getRooms(),
          masterService.getPeriods()
        ]);
        
        setClasses(classesRes.data || []);
        setTeachers(teachersRes.items || []);
        setRooms(roomsRes.data || []);
        setPeriods(periodsRes.data || []);
        
        setLoading(false);
      } catch (err) {
        setError('マスターデータの取得に失敗しました。');
        setLoading(false);
        console.error('Master data fetch error:', err);
      }
    };

    fetchMasterData();
  }, []);

  // 時間割データの取得
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (selectedClassId) {
        response = await scheduleService.getSchedulesByClass(Number(selectedClassId));
      } else if (selectedTeacherId) {
        response = await scheduleService.getSchedulesByTeacher(Number(selectedTeacherId));
      } else if (selectedRoomId) {
        response = await scheduleService.getSchedulesByRoom(Number(selectedRoomId));
      } else {
        // デフォルトでは何も表示しない
        setSchedules([]);
        setLoading(false);
        return;
      }
      
      setSchedules(response.data || []);
      setLoading(false);
    } catch (err) {
      setError('時間割データの取得に失敗しました。');
      setLoading(false);
      console.error('Schedule data fetch error:', err);
    }
  };

  // フィルター変更時に時間割を取得
  useEffect(() => {
    if (selectedClassId || selectedTeacherId || selectedRoomId) {
      fetchSchedules();
    }
  }, [selectedClassId, selectedTeacherId, selectedRoomId]);

  // クラス選択ハンドラー
  const handleClassChange = (event: SelectChangeEvent<number | ''>) => {
    setSelectedClassId(event.target.value);
    setSelectedTeacherId('');
    setSelectedRoomId('');
  };

  // 教員選択ハンドラー
  const handleTeacherChange = (event: SelectChangeEvent<number | ''>) => {
    setSelectedTeacherId(event.target.value);
    setSelectedClassId('');
    setSelectedRoomId('');
  };

  // 教室選択ハンドラー
  const handleRoomChange = (event: SelectChangeEvent<number | ''>) => {
    setSelectedRoomId(event.target.value);
    setSelectedClassId('');
    setSelectedTeacherId('');
  };

  // CSVエクスポート
  const handleExport = async () => {
    try {
      let filter = {};
      
      if (selectedClassId) {
        filter = { classId: selectedClassId };
      } else if (selectedTeacherId) {
        filter = { teacherId: selectedTeacherId };
      } else if (selectedRoomId) {
        filter = { roomId: selectedRoomId };
      }
      
      const blob = await scheduleService.exportSchedules(filter);
      
      // ダウンロード用のリンクを作成
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '時間割.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('エクスポートに失敗しました。');
      console.error('Export error:', err);
    }
  };

  // 時間割表の作成
  const renderScheduleTable = () => {
    if (schedules.length === 0) {
      return <Typography>表示する時間割がありません。フィルターを選択してください。</Typography>;
    }

    // 曜日の配列
    const daysOfWeek = ['月', '火', '水', '木', '金'];
    
    // 時間割をマトリックス形式に変換
    const scheduleMatrix: { [key: string]: Schedule } = {};
    
    schedules.forEach(schedule => {
      const key = `${schedule.dayOfWeek}-${schedule.periodId}`;
      scheduleMatrix[key] = schedule;
    });

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>時限</TableCell>
              {daysOfWeek.map((day, index) => (
                <TableCell key={index} align="center">{day}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {periods.sort((a, b) => a.order - b.order).map((period) => (
              <TableRow key={period.id}>
                <TableCell component="th" scope="row">
                  {period.name}<br />
                  <Typography variant="caption">
                    {period.startTime} - {period.endTime}
                  </Typography>
                </TableCell>
                {daysOfWeek.map((_, dayIndex) => {
                  const dayOfWeek = dayIndex + 1;
                  const key = `${dayOfWeek}-${period.id}`;
                  const schedule = scheduleMatrix[key];
                  
                  return (
                    <TableCell key={dayIndex} align="center">
                      {schedule ? (
                        <>
                          <Typography variant="body2" fontWeight="bold">
                            {schedule.subject?.name}
                          </Typography>
                          <Typography variant="caption" display="block">
                            教室: {schedule.rooms?.map(r => r.name).join(', ') || '未設定'}
                          </Typography>
                          <Typography variant="caption" display="block">
                            担当: {schedule.teachers?.map(t => t.name).join(', ') || '未設定'}
                          </Typography>
                        </>
                      ) : null}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        時間割表示
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="class-select-label">クラス</InputLabel>
              <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClassId}
                label="クラス"
                onChange={handleClassChange}
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
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="teacher-select-label">教員</InputLabel>
              <Select
                labelId="teacher-select-label"
                id="teacher-select"
                value={selectedTeacherId}
                label="教員"
                onChange={handleTeacherChange}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>選択してください</em>
                </MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="room-select-label">教室</InputLabel>
              <Select
                labelId="room-select-label"
                id="room-select"
                value={selectedRoomId}
                label="教室"
                onChange={handleRoomChange}
                disabled={loading}
              >
                <MenuItem value="">
                  <em>選択してください</em>
                </MenuItem>
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            disabled={loading || (!selectedClassId && !selectedTeacherId && !selectedRoomId)}
          >
            CSVエクスポート
          </Button>
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        renderScheduleTable()
      )}
    </Box>
  );
};
