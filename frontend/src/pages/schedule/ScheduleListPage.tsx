import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { TimetableGrid } from '../../components/timetable/TimetableGrid';
import { TimetableFilterComponent } from '../../components/timetable/TimetableFilter';
import { timetableService } from '../../services/timetableService';
import { classService } from '../../services/classService';
import { useAuth } from '../../contexts/AuthContext';
import { Timetable, TimetableFilterParams, WeeklyTimetable } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`timetable-tabpanel-${index}`}
      aria-labelledby={`timetable-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ScheduleListPage: React.FC = () => {
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable>({});
  const [classes, setClasses] = useState<Array<{ id: number; grade: number; class_name: string }>>([]);
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
      setClasses(classesResponse);

      // デフォルトで時間割一覧を取得
      await loadTimetables();
    } catch (err: any) {
      setError(err.message || '初期データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadTimetables = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await timetableService.getTimetables(filter);
      setTimetables(response);
    } catch (err: any) {
      setError(err.message || '時間割の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyTimetable = async (classId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await timetableService.getWeeklyTimetable(classId);
      setWeeklyTimetable(response);
    } catch (err: any) {
      setError(err.message || '週間時間割の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: TimetableFilterParams) => {
    setFilter(newFilter);
  };

  const handleApplyFilter = () => {
    if (tabValue === 0) {
      loadTimetables();
    } else if (filter.class_id) {
      loadWeeklyTimetable(filter.class_id);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1 && filter.class_id) {
      loadWeeklyTimetable(filter.class_id);
    }
  };

  const handleRefresh = () => {
    if (tabValue === 0) {
      loadTimetables();
    } else if (filter.class_id) {
      loadWeeklyTimetable(filter.class_id);
    }
  };

  const canCreateTimetable = authState.user?.role === 'admin';

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* ヘッダー */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            時間割管理
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              更新
            </Button>
            {canCreateTimetable && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  console.log('時間割作成ページへ遷移');
                }}
              >
                時間割作成
              </Button>
            )}
          </Box>
        </Box>

        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* フィルター */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <TimetableFilterComponent
            filter={filter}
            onFilterChange={handleFilterChange}
            onApplyFilter={handleApplyFilter}
            classes={classes}
          />
        </Paper>

        {/* タブ */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="時間割表示タブ">
            <Tab label="一覧表示" />
            <Tab label="週間表示" disabled={!filter.class_id} />
          </Tabs>
        </Paper>

        {/* ローディング */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* コンテンツ */}
        {!loading && (
          <>
            <TabPanel value={tabValue} index={0}>
              <TimetableListView timetables={timetables} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {filter.class_id ? (
                <TimetableGrid weeklyTimetable={weeklyTimetable} />
              ) : (
                <Alert severity="info">
                  クラスを選択してください
                </Alert>
              )}
            </TabPanel>
          </>
        )}
      </Box>
    </Container>
  );
};

// 時間割一覧表示コンポーネント
const TimetableListView: React.FC<{ timetables: Timetable[] }> = ({ timetables }) => {
  if (timetables.length === 0) {
    return (
      <Alert severity="info">
        時間割データがありません
      </Alert>
    );
  }

  return (
    <Box>
      {timetables.map((timetable) => (
        <Paper key={timetable.id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {timetable.subject?.name || '科目名'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                クラス: {timetable.class?.grade}年{timetable.class?.class_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                担当: {timetable.teacher?.name || '担当者'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                時間: {getDayLabel(timetable.day)}曜日 {timetable.period}限
              </Typography>
              <Typography variant="body2" color="text.secondary">
                教室: {timetable.room}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                科目コード: {timetable.subject?.code}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

// 曜日ラベル取得関数
const getDayLabel = (day: string): string => {
  const dayMap: { [key: string]: string } = {
    monday: '月',
    tuesday: '火',
    wednesday: '水',
    thursday: '木',
    friday: '金'
  };
  return dayMap[day] || day;
};
