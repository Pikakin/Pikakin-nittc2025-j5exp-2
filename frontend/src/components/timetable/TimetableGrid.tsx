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
  Box
} from '@mui/material';
import { WeeklyTimetable } from '../../types';

interface TimetableGridProps {
  weeklyTimetable: WeeklyTimetable;
}

const PERIODS = [1, 2, 3, 4];
const DAYS = [
  { key: 'monday', label: '月' },
  { key: 'tuesday', label: '火' },
  { key: 'wednesday', label: '水' },
  { key: 'thursday', label: '木' },
  { key: 'friday', label: '金' }
];

export const TimetableGrid: React.FC<TimetableGridProps> = ({ weeklyTimetable }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>時限</TableCell>
            {DAYS.map((day) => (
              <TableCell key={day.key} align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                {day.label}曜日
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {PERIODS.map((period) => (
            <TableRow key={period}>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                {period}限
              </TableCell>
              {DAYS.map((day) => {
                const timetable = weeklyTimetable[day.key]?.[period];
                return (
                  <TableCell key={`${day.key}-${period}`} align="center" sx={{ minHeight: 80, verticalAlign: 'top' }}>
                    {timetable ? (
                      <Box sx={{ p: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {timetable.subject?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {timetable.teacher?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {timetable.room}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
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
  );
};
