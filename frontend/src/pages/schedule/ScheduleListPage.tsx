import {
  Alert, 
  Box, Button,CircularProgress, FormControl,Grid, 
  InputLabel, MenuItem, Paper, Select, Tab, Tabs, Typography 
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { ScheduleTable } from '../../components/schedule/ScheduleTable';
import { useAuth } from '../../contexts/AuthContext';
import { masterService } from '../../services/masterService';
import { scheduleService } from '../../services/scheduleService';
import { Class, Room, Schedule, Teacher } from '../../types';

// TabPanelコンポーネント
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const ScheduleListPage: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  
  // タブの状態
  const [tabValue, setTabValue] = useState(0);
  
  // フィルター状態
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
  
  // データ状態
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  
  // ローディング状態
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 初期表示時にマスターデータを取得
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // マスターデータを取得
        const [classesResponse, roomsResponse] = await Promise.all([
          masterService.getClasses(),
          masterService.getRooms()
        ]);
        
        setClasses(classesResponse.data);
        setRooms(roomsResponse.data);
        
        // 教員データは別途取得（APIに合わせて調整）
        // ここでは仮のデータを設定
        setTeachers([
          { id: 1, name: '山田 太郎', username: 'yamada' },
          { id: 2, name: '佐藤 次郎', username: 'sato' },
          { id: 3, name: '鈴木 三郎', username: 'suzuki' }
        ]);
        
        // 学生の場合は自動的に所属クラスを選択
        if (user?.role === 'student' && user.classId) {
          setSelectedClassId(user.classId);
          setTabValue(0); // クラス別タブを選択
          
          // クラスの時間割を取得
          const scheduleResponse = await scheduleService.getClassSchedule(user.classId);
          setSchedules(scheduleResponse.data);
        }
        // 教員の場合は自動的に自分の時間割を選択
        else if (user?.role === 'teacher') {
          setSelectedTeacherId(user.id);
          setTabValue(1); // 教員別タブを選択
          
          // 教員の時間割を取得
          const scheduleResponse = await scheduleService.getTeacherSchedule(user.id);
          setSchedules(scheduleResponse.data);
        }
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'マスターデータの取得に失敗しました。');
        setLoading(false);
      }
    };
    
    fetchMasterData();
  }, [user]);
  
  // タブ変更時の処理
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // タブに応じてフィルターをリセット
    if (newValue === 0) {
      setSelectedTeacherId('');
      setSelectedRoomId('');
      
      // 学生の場合は自動的に所属クラスを選択
      if (user?.role === 'student' && user.classId) {
        setSelectedClassId(user.classId);
      } else {
        setSelectedClassId('');
      }
    } else if (newValue === 1) {
      setSelectedClassId('');
      setSelectedRoomId('');
      
      // 教員の場合は自動的に自分を選択
      if (user?.role === 'teacher') {
        setSelectedTeacherId(user.id);
      } else {
        setSelectedTeacherId('');
      }
    } else if (newValue === 2) {
      setSelectedClassId('');
      setSelectedTeacherId('');
      setSelectedRoomId('');
    }
  };
  
  // クラス選択時の処理
  const handleClassChange = async (classId: number) => {
    setSelectedClassId(classId);
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await scheduleService.getClassSchedule(classId);
      setSchedules(response.data);
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'クラスの時間割取得に失敗しました。');
      setLoading(false);
    }
  };
  
  // 教員選択時の処理
  const handleTeacherChange = async (teacherId: number) => {
    setSelectedTeacherId(teacherId);
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await scheduleService.getTeacherSchedule(teacherId);
      setSchedules(response.data);
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || '教員の時間割取得に失敗しました。');
      setLoading(false);
    }
  };
  
  // 教室選択時の処理
  const handleRoomChange = async (roomId: number) => {
    setSelectedRoomId(roomId);
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await scheduleService.getRoomSchedule(roomId);
      setSchedules(response.data);
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || '教室の時間割取得に失敗しました。');
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        時間割表示
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="クラス別" />
          <Tab label="教員別" />
          <Tab label="教室別" />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          <TabPanel value={tabValue} index={0}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="class-select-label">クラスを選択</InputLabel>
              <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value as number)}
                label="クラスを選択"
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
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="teacher-select-label">教員を選択</InputLabel>
              <Select
                labelId="teacher-select-label"
                id="teacher-select"
                value={selectedTeacherId}
                onChange={(e) => handleTeacherChange(e.target.value as number)}
                label="教員を選択"
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
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel id="room-select-label">教室を選択</InputLabel>
              <Select
                labelId="room-select-label"
                id="room-select"
                value={selectedRoomId}
                onChange={(e) => handleRoomChange(e.target.value as number)}
                label="教室を選択"
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
          </TabPanel>
        </Box>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {schedules.length === 0 ? (
            <Alert severity="info">
              {tabValue === 0 && '選択したクラスの時間割データがありません。'}
              {tabValue === 1 && '選択した教員の時間割データがありません。'}
              {tabValue === 2 && '選択した教室の時間割データがありません。'}
            </Alert>
          ) : (
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item>
                  <Typography variant="h6">
                    {tabValue === 0 && `${classes.find(c => c.id === selectedClassId)?.name || ''} の時間割`}
                    {tabValue === 1 && `${teachers.find(t => t.id === selectedTeacherId)?.name || ''} の時間割`}
                    {tabValue === 2 && `${rooms.find(r => r.id === selectedRoomId)?.name || ''} の時間割`}
                  </Typography>
                </Grid>
                <Grid item sx={{ flexGrow: 1 }} />
                {user?.role === 'teacher' && (
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => window.location.href = '/requests/create'}
                    >
                      変更申請
                    </Button>
                  </Grid>
                )}
              </Grid>
              
              <ScheduleTable
                schedules={schedules}
                showTeacher={tabValue === 0}
                showClass={tabValue === 1 || tabValue === 2}
                showRoom={tabValue !== 2}
              />
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

