import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { WeeklyTimetable, Timetable } from '../../types';
import { timetableService } from '../../services/timetableService';

interface WeeklyTimetableGridProps {
  classId: number;
  className: string;
}

const DAYS = [
  { key: 'monday', label: '月' },
  { key: 'tuesday', label: '火' },
  { key: 'wednesday', label: '水' },
  { key: 'thursday', label: '木' },
  { key: 'friday', label: '金' },
];

const PERIODS = [1, 2, 3, 4];

export const WeeklyTimetableGrid: React.FC<WeeklyTimetableGridProps> = ({
  classId,
  className,
}) => {
  const [weeklyTimetable, setWeeklyTimetable] = useState<WeeklyTimetable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchWeeklyTimetable = async () => {
      setLoading(true);
      try {
        const data = await timetableService.getWeeklyTimetable(classId);
        setWeeklyTimetable(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyTimetable();
  }, [classId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!weeklyTimetable) {
    return (
      <Alert severity="info">
        時間割データがありません
      </Alert>
    );
  }

  // モバイル表示用のコンポーネント
  if (isMobile) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {className} の時間割
        </Typography>
        {DAYS.map((day) => (
          <Paper key={day.key} sx={{ mb: 2, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {day.label}曜日
            </Typography>
            <Grid container spacing={1}>
              {PERIODS.map((period) => {
                const timetable = weeklyTimetable.schedule[day.key]?.[period];
                return (
                  <Grid item xs={6} key={period}>
                    <TimetableCard
                      period={period}
                      timetable={timetable}
                      compact
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        ))}
      </Box>
    );
  }

  // デスクトップ表示用のグリッド
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {className} の時間割
      </Typography>
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto repeat(5, 1fr)', gap: 1, p: 1 }}>
          {/* ヘッダー行 */}
          <Box sx={{ p: 1 }}></Box>
          {DAYS.map((day) => (
            <Box
              key={day.key}
              sx={{
                p: 1,
                textAlign: 'center',
                fontWeight: 'bold',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
            >
              {day.label}
            </Box>
          ))}

          {/* 時間割グリッド */}
          {PERIODS.map((period) => (
            <React.Fragment key={period}>
              <Box
                sx={{
                  p: 1,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  backgroundColor: theme.palette.grey[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {period}限
              </Box>
              {DAYS.map((day) => {
                const timetable = weeklyTimetable.schedule[day.key]?.[period];
                return (
                  <Box key={`${day.key}-${period}`} sx={{ minHeight: 120 }}>
                    <TimetableCard
                      period={period}
                      timetable={timetable}
                    />
                  </Box>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

// 時間割カードコンポーネント
interface TimetableCardProps {
  period: number;
  timetable: Timetable | null | undefined;
  compact?: boolean;
}

const TimetableCard: React.FC<TimetableCardProps> = ({ 
  period, 
  timetable, 
  compact = false 
}) => {
  const theme = useTheme();

  if (!timetable) {
    return (
      <Card 
        sx={{ 
          height: '100%', 
          minHeight: compact ? 80 : 120,
          backgroundColor: theme.palette.grey[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          空き時間
        </Typography>
      </Card>
    );
  }

  const getTermColor = (term: string) => {
    switch (term) {
      case 'first': return 'primary';
      case 'second': return 'secondary';
      case 'full': return 'success';
      default: return 'default';
    }
  };

  const getTermLabel = (term: string) => {
    switch (term) {
      case 'first': return '前期';
      case 'second': return '後期';
      case 'full': return '通年';
      default: return term;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        minHeight: compact ? 80 : 120,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ p: compact ? 1 : 2, '&:last-child': { pb: compact ? 1 : 2 } }}>
        <Typography 
          variant={compact ? "body2" : "subtitle2"} 
          component="div" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {timetable.subject?.name || '科目名なし'}
        </Typography>
        
        {!compact && (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {timetable.teacher?.name || '担当者未定'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {timetable.room}
            </Typography>
          </>
        )}

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: compact ? 0.5 : 1 }}>
          {timetable.subject?.term && (
            <Chip
              label={getTermLabel(timetable.subject.term)}
              size="small"
              color={getTermColor(timetable.subject.term) as any}
              variant="outlined"
            />
          )}
          {compact && (
            <Chip
              label={timetable.room}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};