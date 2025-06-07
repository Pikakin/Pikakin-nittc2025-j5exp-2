import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { TimetableGrid } from '../../components/timetable/TimetableGrid';
import { TimetableFilter } from '../../components/timetable/TimetableFilter';
import { timetableService } from '../../services/timetableService';
import { classService } from '../../services/classService';
import { Timetable, WeeklyTimetable, TimetableFilterParams, Class } from '../../types';

export const ScheduleListPage: React.FC = () => {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable>({});
  const [classes, setClasses] = useState<Class[]>([]);
  const [filter, setFilter] = useState<TimetableFilterParams>({});
  const [tabValue, setTabValue] = useState(0);

  // 初期データ読み込み
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // クラス一覧を取得
      const classesResponse = await classService.getClasses();
      console.log('Classes response:', classesResponse);
      
      // null チェックを追加
      if (classesResponse && Array.isArray(classesResponse)) {
        setClasses(classesResponse);

        // デフォルトで1年1組の週間時間割を表示
        if (classesResponse.length > 0) {
          const firstClass = classesResponse[0];
          setFilter({ class_id: firstClass.id });
          await loadWeeklyTimetable(firstClass.id);
        }
      } else {
        console.warn('Classes response is not an array:', classesResponse);
        setClasses([]);
      }
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      setError('データの読み込みに失敗しました: ' + (err.message || '不明なエラー'));
      setClasses([]); // エラー時も空配列を設定
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyTimetable = async (classId: number) => {
    try {
      setLoading(true);
      const weekly = await timetableService.getWeeklyTimetable(classId);
      console.log('Weekly timetable response:', weekly);
      
      // null チェックを追加
      if (weekly && typeof weekly === 'object') {
        setWeeklyTimetable(weekly);
      } else {
        console.warn('Weekly timetable response is invalid:', weekly);
        setWeeklyTimetable({});
      }
    } catch (err: any) {
      console.error('Failed to load weekly timetable:', err);
      setError('週間時間割の読み込みに失敗しました: ' + (err.message || '不明なエラー'));
      setWeeklyTimetable({}); // エラー時も空オブジェクトを設定
    } finally {
      setLoading(false);
    }
  };

  const loadTimetables = async () => {
    try {
      setLoading(true);
      const timetablesResponse = await timetableService.getTimetables(filter);
      console.log('Timetables response:', timetablesResponse);
      
      // null チェックを追加
      if (timetablesResponse && Array.isArray(timetablesResponse)) {
        setTimetables(timetablesResponse);
      } else {
        console.warn('Timetables response is not an array:', timetablesResponse);
        setTimetables([]);
      }
    } catch (err: any) {
      console.error('Failed to load timetables:', err);
      setError('時間割の読み込みに失敗しました: ' + (err.message || '不明なエラー'));
      setTimetables([]); // エラー時も空配列を設定
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: TimetableFilterParams) => {
    setFilter(newFilter);
  };

  const handleApplyFilter = () => {
    if (tabValue === 0 && filter.class_id) {
      // 週間表示の場合
      loadWeeklyTimetable(filter.class_id);
    } else {
      // 一覧表示の場合
      loadTimetables();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0 && filter.class_id) {
      loadWeeklyTimetable(filter.class_id);
    } else if (newValue === 1) {
      loadTimetables();
    }
  };

  const getSelectedClassName = () => {
    if (filter.class_id && classes && classes.length > 0) {
      const selectedClass = classes.find(c => c.id === filter.class_id);
      return selectedClass ? `${selectedClass.grade}-${selectedClass.class_name}` : '';
    }
    return '';
  };

  // 初期ローディング中
  if (loading && (!classes || classes.length === 0) && (!timetables || timetables.length === 0)) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        時間割表示
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* フィルター */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TimetableFilter
          filter={filter}
          classes={classes || []} // null の場合は空配列
          onFilterChange={handleFilterChange}
          onApplyFilter={handleApplyFilter}
        />
      </Paper>

      {/* タブ */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="週間表示" />
          <Tab label="一覧表示" />
        </Tabs>
      </Box>

      {/* コンテンツ */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabValue === 0 && (
            <TimetableGrid 
              weeklyTimetable={weeklyTimetable || {}} // null の場合は空オブジェクト
              className={getSelectedClassName()}
            />
          )}
          
          {tabValue === 1 && (
            <Paper sx={{ p: 2 }}>
              {timetables && timetables.length > 0 ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    時間割一覧 ({timetables.length}件)
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {timetables.map((timetable) => (
                      <Box key={timetable.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                        <Typography variant="subtitle1">
                          {timetable.grade}-{timetable.class_name} | {getDayLabel(timetable.day_of_week)} {timetable.period}限
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          科目: {timetable.subject_name} | 教員: {timetable.teacher_name} | 教室: {timetable.room}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  条件に一致する時間割がありません
                </Typography>
              )}
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

// ヘルパー関数
const getDayLabel = (day: string): string => {
  const dayMap: { [key: string]: string } = {
    'monday': '月',
    'tuesday': '火',
    'wednesday': '水',
    'thursday': '木',
    'friday': '金'
  };
  return dayMap[day] || day;
};
