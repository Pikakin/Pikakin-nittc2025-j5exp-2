import {
  Add as AddIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import {Alert, 
  Box, Button, Chip, CircularProgress, IconButton,Pagination, Paper, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tabs, 
  Tooltip, Typography 
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/requestService';
import { ChangeRequest } from '../../types';

// タブパネル
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`request-tabpanel-${index}`}
      aria-labelledby={`request-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const RequestListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();
  
  // タブの状態
  const [tabValue, setTabValue] = useState(0);
  
  // 申請データ
  const [pendingRequests, setPendingRequests] = useState<ChangeRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<ChangeRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<ChangeRequest[]>([]);
  
  // ページネーション
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // 状態管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // 成功メッセージの表示（リダイレクト時）
  useEffect(() => {
    if (location.state && location.state.success) {
      setSuccessMessage('変更申請が正常に送信されました。');
      
      // 状態をクリア（ブラウザバック時に再表示されないように）
      window.history.replaceState({}, document.title);
      
      // 3秒後にメッセージを消す
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);
  
  // タブ変更時に対応するステータスの申請を取得
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let status: string;
        switch (tabValue) {
          case 0:
            status = 'pending';
            break;
          case 1:
            status = 'approved';
            break;
          case 2:
            status = 'rejected';
            break;
          default:
            status = 'pending';
        }
        
        // 管理者は全ての申請を、教員は自分の申請のみを取得
        const response = authState.user?.role === 'admin'
          ? await requestService.getRequests(page, 10, status)
          : await requestService.getMyRequests(page, 10, status);
        
        const { items, totalPages: total } = response;
        
        switch (tabValue) {
          case 0:
            setPendingRequests(items);
            break;
          case 1:
            setApprovedRequests(items);
            break;
          case 2:
            setRejectedRequests(items);
            break;
        }
        
        setTotalPages(total);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || '申請データの取得に失敗しました。');
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [tabValue, page, authState.user?.role]);
  
  // タブ変更ハンドラ
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1); // タブ変更時はページを1に戻す
  };
  
  // ページ変更ハンドラ
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // 申請取り消しハンドラ
  const handleCancelRequest = async (id: number) => {
    if (!window.confirm('この申請を取り消しますか？')) {
      return;
    }
    
    try {
      setLoading(true);
      await requestService.cancelRequest(id);
      
      // 申請リストから削除
      setPendingRequests(prev => prev.filter(req => req.id !== id));
      
      setSuccessMessage('申請が取り消されました。');
      setLoading(false);
      
      // 3秒後にメッセージを消す
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || '申請の取り消しに失敗しました。');
      setLoading(false);
    }
  };
  
  // 曜日の日本語表示
  const getDayOfWeekLabel = (dayOfWeek: number) => {
    const days = ['月', '火', '水', '木', '金'];
    return days[dayOfWeek - 1] || '';
  };
  
  // ステータスに応じたチップを表示
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="審査中" color="warning" size="small" />;
      case 'approved':
        return <Chip label="承認済" color="success" size="small" />;
      case 'rejected':
        return <Chip label="却下" color="error" size="small" />;
      default:
        return <Chip label="不明" size="small" />;
    }
  };
  
  // 申請テーブルを表示
  const renderRequestTable = (requests: ChangeRequest[]) => (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>科目</TableCell>
            <TableCell>変更前</TableCell>
            <TableCell>変更後</TableCell>
            <TableCell>申請者</TableCell>
            <TableCell>申請日</TableCell>
            <TableCell>ステータス</TableCell>
            <TableCell>アクション</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                申請がありません
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>
                  {request.originalSchedule?.subject?.name || '不明'}
                </TableCell>
                <TableCell>
                  {getDayOfWeekLabel(request.originalSchedule?.dayOfWeek || 0)}曜日
                  {request.originalSchedule?.period?.name || ''}
                </TableCell>
                <TableCell>
                  {getDayOfWeekLabel(request.newDayOfWeek)}曜日
                  {request.newPeriod?.name || ''}
                </TableCell>
                <TableCell>
                  {request.requestedByUser?.name || '不明'}
                </TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {getStatusChip(request.status)}
                </TableCell>
                <TableCell>
                  <Tooltip title="詳細を表示">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/requests/${request.id}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {/* 審査中の自分の申請のみ取り消し可能 */}
                  {request.status === 'pending' && 
                   request.requestedByUserId === authState.user?.id && (
                    <Tooltip title="申請を取り消す">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {/* 管理者のみ承認/却下ボタンを表示 */}
                  {request.status === 'pending' && authState.user?.role === 'admin' && (
                    <>
                      <Tooltip title="承認">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => navigate(`/requests/${request.id}?action=approve`)}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="却下">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => navigate(`/requests/${request.id}?action=reject`)}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          時間割変更申請
        </Typography>
        
        {/* 教員と管理者のみ新規申請ボタンを表示 */}
        {(authState.user?.role === 'admin' || authState.user?.role === 'teacher') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/requests/create')}
          >
            新規申請
          </Button>
        )}
      </Box>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="審査中" />
          <Tab label="承認済" />
          <Tab label="却下" />
        </Tabs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              {renderRequestTable(pendingRequests)}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderRequestTable(approvedRequests)}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {renderRequestTable(rejectedRequests)}
            </TabPanel>
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};
