import { Add as AddIcon } from '@mui/icons-material';
import {
  Box, Button, Chip, CircularProgress, 
  FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination,TableRow, Typography 
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/scheduleService';
import { ChangeRequest, RequestStatus } from '../../types';

export const RequestListPage: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');

  // 変更申請一覧の取得
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (authState.user?.role === 'admin') {
        // 管理者はすべての申請を表示
        response = await requestService.getRequests(page + 1, rowsPerPage, statusFilter || undefined);
      } else {
        // 教員は自分の申請のみ表示
        response = await requestService.getMyRequests(page + 1, rowsPerPage, statusFilter || undefined);
      }
      
      setRequests(response.items || []);
      setTotalItems(response.total || 0);
      setLoading(false);
    } catch (err) {
      setError('変更申請の取得に失敗しました。');
      setLoading(false);
      console.error('Request fetch error:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, rowsPerPage, statusFilter, authState.user]);

  // ページ変更ハンドラー
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // 1ページあたりの行数変更ハンドラー
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ステータスフィルター変更ハンドラー
  const handleStatusFilterChange = (event: SelectChangeEvent<RequestStatus | ''>) => {
    setStatusFilter(event.target.value as RequestStatus | '');
    setPage(0);
  };

  // 申請詳細ページへの遷移
  const handleViewRequest = (id: number) => {
    navigate(`/requests/${id}`);
  };

  // ステータスに応じたChipの色を取得
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // ステータスの日本語表示
  const getStatusLabel = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return '承認待ち';
      case 'approved':
        return '承認済み';
      case 'rejected':
        return '却下';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          時間割変更申請一覧
        </Typography>
        
        {(authState.user?.role === 'teacher' || authState.user?.role === 'admin') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/requests/new"
          >
            新規申請
          </Button>
        )}
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">ステータス</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="ステータス"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">すべて</MenuItem>
              <MenuItem value="pending">承認待ち</MenuItem>
              <MenuItem value="approved">承認済み</MenuItem>
              <MenuItem value="rejected">却下</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>科目</TableCell>
                    <TableCell>クラス</TableCell>
                    <TableCell>変更内容</TableCell>
                    <TableCell>申請者</TableCell>
                    <TableCell>申請日時</TableCell>
                    <TableCell>ステータス</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.id}</TableCell>
                        <TableCell>{request.subject?.name}</TableCell>
                        <TableCell>{request.class?.name}</TableCell>
                        <TableCell>
                          {request.originalSchedule && (
                            <>
                              {['月', '火', '水', '木', '金'][request.originalSchedule.dayOfWeek - 1]}曜
                              {request.originalSchedule.period?.name} →{' '}
                              {['月', '火', '水', '木', '金'][request.newDayOfWeek - 1]}曜
                              {request.newPeriod?.name}
                            </>
                          )}
                        </TableCell>
                        <TableCell>{request.requestedByUser?.name}</TableCell>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleString('ja-JP')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(request.status)}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewRequest(request.id)}
                          >
                            詳細
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        表示する変更申請がありません。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="表示件数:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};
