import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { WeeklyTimetable } from '../../types';

interface TimetableGridProps {
  weeklyTimetable: WeeklyTimetable;
  className?: string;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  weeklyTimetable, 
  className 
}) => {
  const days = [
    { key: 'monday', label: '月' },
    { key: 'tuesday', label: '火' },
    { key: 'wednesday', label: '水' },
    { key: 'thursday', label: '木' },
    { key: 'friday', label: '金' }
  ];

  const periods = [1, 2, 3, 4];

  return (
    <Box>
      {className && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          {className} 時間割
        </Typography>
      )}
      
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', minWidth: 60 }}>時限</TableCell>
              {days.map((day) => (
                <TableCell key={day.key} align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>
                  {day.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {periods.map((period) => (
              <TableRow key={period}>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                  {period}
                </TableCell>
                {days.map((day) => {
                  const timetable = weeklyTimetable[day.key]?.[period];
                  return (
                    <TableCell key={`${day.key}-${period}`} align="center" sx={{ height: 80 }}>
                      {timetable ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {timetable.subject_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {timetable.teacher_name}
                          </Typography>
                          {timetable.room && (
                            <Chip 
                              label={timetable.room} 
                              size="small" 
                              variant="outlined"
                              sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          空
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
