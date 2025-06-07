import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { Timetable } from '../../types';

interface TimetableDetailModalProps {
  open: boolean;
  onClose: () => void;
  timetable: Timetable | null;
}

export const TimetableDetailModal: React.FC<TimetableDetailModalProps> = ({
  open,
  onClose,
  timetable,
}) => {
  if (!timetable) return null;

  const getDayLabel = (day: string) => {
    const dayMap: { [key: string]: string } = {
      monday: '月曜日',
      tuesday: '火曜日',
      wednesday: '水曜日',
      thursday: '木曜日',
      friday: '金曜日',
    };
    return dayMap[day] || day;
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        時間割詳細
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Typography variant="h6" gutterBottom>
            {timetable.subject?.name || '科目名なし'}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${timetable.subject?.code || 'コードなし'}`}
              variant="outlined"
              sx={{ mr: 1 }}
            />
            {timetable.subject?.term && (
              <Chip
                label={getTermLabel(timetable.subject.term)}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                クラス
              </Typography>
              <Typography>
                {timetable.class?.grade}-{timetable.class?.class_name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                時間
              </Typography>
              <Typography>
                {getDayLabel(timetable.day)} {timetable.period}限
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                教室
              </Typography>
              <Typography>
                {timetable.room}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                担当教員
              </Typography>
              <Typography>
                {timetable.teacher?.name || '担当者未定'}
              </Typography>
            </Box>

            {timetable.subject?.credits && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  単位数
                </Typography>
                <Typography>
                  {timetable.subject.credits}単位
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
};