import {Box, 
  Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,Tooltip, Typography 
} from '@mui/material';
import React from 'react';
import { Schedule } from '../../types';

interface ScheduleTableProps {
  schedules: Schedule[];
  showTeacher?: boolean;
  showClass?: boolean;
  showRoom?: boolean;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedules,
  showTeacher = false,
  showClass = false,
  showRoom = true
}) => {
  // 曜日の配列（1: 月曜日, 2: 火曜日, ...）
  const daysOfWeek = [1, 2, 3, 4, 5];
  const dayLabels = ['月', '火', '水', '木', '金'];
  
  // 時限の配列を取得（スケジュールから一意の時限IDを抽出）
  const periodIds = [...new Set(schedules.map(s => s.periodId))].sort();
  
  // 時限名のマッピングを作成
  const periodMap = new Map<number, string>();
  schedules.forEach(s => {
    if (s.periodId && s.period?.name) {
      periodMap.set(s.periodId, s.period.name);
    }
  });
  
  // 時間割表のセルデータを取得
  const getScheduleForCell = (periodId: number, dayOfWeek: number) => {
    return schedules.filter(s => s.periodId === periodId && s.dayOfWeek === dayOfWeek);
  };
  
  // セルの内容を表示
  const renderCellContent = (cellSchedules: Schedule[]) => {
    if (cellSchedules.length === 0) {
      return null;
    }
    
    return cellSchedules.map((schedule, index) => (
      <Tooltip
        key={schedule.id}
        title={
          <Box>
            <Typography variant="body2">科目: {schedule.subject?.name}</Typography>
            {showClass && schedule.class && (
              <Typography variant="body2">クラス: {schedule.class.name}</Typography>
            )}
            {showTeacher && schedule.teacher && (
              <Typography variant="body2">教員: {schedule.teacher.name}</Typography>
            )}
            {showRoom && schedule.rooms && schedule.rooms.length > 0 && (
              <Typography variant="body2">
                教室: {schedule.rooms.map(r => r.name).join(', ')}
              </Typography>
            )}
          </Box>
        }
      >
        <Box
          sx={{
            p: 1,
            mb: index < cellSchedules.length - 1 ? 1 : 0,
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            borderRadius: 1,
            fontSize: '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          <Typography variant="body2" noWrap>
            {schedule.subject?.name}
          </Typography>
          {showClass && schedule.class && (
            <Typography variant="caption" display="block" noWrap>
              {schedule.class.name}
            </Typography>
          )}
          {showTeacher && schedule.teacher && (
            <Typography variant="caption" display="block" noWrap>
              {schedule.teacher.name}
            </Typography>
          )}
          {showRoom && schedule.rooms && schedule.rooms.length > 0 && (
            <Typography variant="caption" display="block" noWrap>
              {schedule.rooms.map(r => r.name).join(', ')}
            </Typography>
          )}
        </Box>
      </Tooltip>
    ));
  };
  
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width="8%" align="center">時限</TableCell>
            {daysOfWeek.map((day, index) => (
              <TableCell key={day} align="center" width="18.4%">
                {dayLabels[index]}曜日
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {periodIds.map(periodId => (
            <TableRow key={periodId}>
              <TableCell align="center">
                {periodMap.get(periodId) || periodId}
              </TableCell>
              {daysOfWeek.map(day => (
                <TableCell key={`${periodId}-${day}`} sx={{ p: 1, height: '100px', verticalAlign: 'top' }}>
                  {renderCellContent(getScheduleForCell(periodId, day))}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
