import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  SelectChangeEvent
} from '@mui/material';
import { TimetableFilterParams } from '../../types/timetable';

interface TimetableFilterProps {
  filter: TimetableFilterParams;
  onFilterChange: (filter: TimetableFilterParams) => void;
  onApplyFilter: () => void;
  classes: Array<{ id: number; grade: number; class_name: string }>;
}

const DAYS = [
  { value: '', label: '全て' },
  { value: 'monday', label: '月曜日' },
  { value: 'tuesday', label: '火曜日' },
  { value: 'wednesday', label: '水曜日' },
  { value: 'thursday', label: '木曜日' },
  { value: 'friday', label: '金曜日' }
];

const GRADES = [
  { value: 0, label: '全学年' },
  { value: 1, label: '1年' },
  { value: 2, label: '2年' },
  { value: 3, label: '3年' },
  { value: 4, label: '4年' },
  { value: 5, label: '5年' }
];

export const TimetableFilterComponent: React.FC<TimetableFilterProps> = ({
  filter,
  onFilterChange,
  onApplyFilter,
  classes
}) => {
  const handleGradeChange = (event: SelectChangeEvent<number>) => {
    const grade = event.target.value as number;
    onFilterChange({
      ...filter,
      grade: grade === 0 ? undefined : grade,
      class_id: undefined // 学年変更時はクラスをリセット
    });
  };

  const handleClassChange = (event: SelectChangeEvent<number>) => {
    const classId = event.target.value as number;
    onFilterChange({
      ...filter,
      class_id: classId === 0 ? undefined : classId
    });
  };

  const handleDayChange = (event: SelectChangeEvent<string>) => {
    const day = event.target.value as string;
    onFilterChange({
      ...filter,
      day: day === '' ? undefined : day
    });
  };

  // 選択された学年のクラス一覧を取得
  const filteredClasses = filter.grade 
    ? classes.filter(cls => cls.grade === filter.grade)
    : classes;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>学年</InputLabel>
            <Select
              value={filter.grade || 0}
              label="学年"
              onChange={handleGradeChange}
            >
              {GRADES.map((grade) => (
                <MenuItem key={grade.value} value={grade.value}>
                  {grade.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>クラス</InputLabel>
            <Select
              value={filter.class_id || 0}
              label="クラス"
              onChange={handleClassChange}
              disabled={!filter.grade}
            >
              <MenuItem value={0}>全クラス</MenuItem>
              {filteredClasses.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.class_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth size="small">
            <InputLabel>曜日</InputLabel>
            <Select
              value={filter.day || ''}
              label="曜日"
              onChange={handleDayChange}
            >
              {DAYS.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            onClick={onApplyFilter}
            fullWidth
            sx={{ height: 40 }}
          >
            フィルター適用
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
