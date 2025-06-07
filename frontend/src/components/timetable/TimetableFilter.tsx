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
import { TimetableFilterParams, Class } from '../../types';

interface TimetableFilterProps {
  filter: TimetableFilterParams;
  classes: Class[];
  onFilterChange: (filter: TimetableFilterParams) => void;
  onApplyFilter: () => void;
}

export const TimetableFilter: React.FC<TimetableFilterProps> = ({
  filter,
  classes,
  onFilterChange,
  onApplyFilter
}) => {
  const handleChange = (field: keyof TimetableFilterParams) => (
    event: SelectChangeEvent<any>
  ) => {
    const value = event.target.value;
    onFilterChange({
      ...filter,
      [field]: value === '' ? undefined : value
    });
  };

  const grades = [1, 2, 3, 4, 5];
  const days = [
    { value: 'monday', label: '月曜日' },
    { value: 'tuesday', label: '火曜日' },
    { value: 'wednesday', label: '水曜日' },
    { value: 'thursday', label: '木曜日' },
    { value: 'friday', label: '金曜日' }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>学年</InputLabel>
            <Select
              value={filter.grade || ''}
              label="学年"
              onChange={handleChange('grade')}
            >
              <MenuItem value="">全て</MenuItem>
              {grades.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  {grade}年
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>クラス</InputLabel>
            <Select
              value={filter.class_id || ''}
              label="クラス"
              onChange={handleChange('class_id')}
            >
              <MenuItem value="">全て</MenuItem>
              {classes && classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.grade}-{cls.class_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>曜日</InputLabel>
            <Select
              value={filter.day_of_week || ''}
              label="曜日"
              onChange={handleChange('day_of_week')}
            >
              <MenuItem value="">全て</MenuItem>
              {days.map((day) => (
                <MenuItem key={day.value} value={day.value}>
                  {day.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Button
            variant="contained"
            onClick={onApplyFilter}
            fullWidth
            sx={{ height: 40 }}
          >
            検索
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
