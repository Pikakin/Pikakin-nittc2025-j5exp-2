import {
  ArrowBack as ArrowBackIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import {Alert, 
  Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider,Grid, Paper, 
  TextField, Typography 
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/requestService';
import { ChangeRequest } from '../../types';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  // 申請データ
  const [request, setRequest] = useState<ChangeRequest | null>(null);
  
  // 状態管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // 承認/却下ダイアログの状態
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // 初期表示時に申請データを取得
  useEffect(() => {
    const fetchRequestDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await requestService.getRequestById(Number(id));
        setRequest(response.data);
        
        // URLパラメータに応じてダイアログを表示
        const action = searchParams.get('action');
        if (action === 'approve') {
          setApproveDialogOpen(true);
        } else if (action === 'reject') {
          setRejectDialogOpen(true);
        }
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || '申請データの取得に失敗しました。');
        setLoading(false);
      }
    };
    
    fetchRequestDetail();
  }, [id, searchParams]);
  
  // 承認ダイアログを開く
  const handleOpenApproveDialog = () => {
    setApproveDialogOpen(true);
  };
  
  // 却下ダイアログを開く
  const handleOpenRejectDialog = () => {
    setRejectDialogOpen(true);
  };
  
  // ダイアログを閉じる
  const handleCloseDialogs = () => {
    setApproveDialogOpen(false);
    setRejectDialogOpen(false);
    
    // URLパラメータをクリア
    if (searchParams.has('action')) {
      navigate(`/requests/${id}`, { replace: true });
    }
  };
  
  // 申請を承認
  const handleApprove = async () => {
    if (!id) return;
    
    try {
      setProcessing(true);
      
      await requestService.approveRequest(Number(id), comment);
      
      setSuccessMessage('申請を承認しました。');
      setApproveDialogOpen(false);
      
      // 申請データを再取得
      const response = await requestService.getRequestById(Number(id));
      setRequest(response.data);
      
      setProcessing(false);
    } catch (err: any) {
      setError(err.message || '申請の承認に失敗しました。');
      setProcessing(false);
    }
  };
  
  // 申請を却下
  const handleReject = async () => {
    if (!id || !rejectReason) return;
    
    try {
      setProcessing(true);
      
      await requestService.rejectRequest(Number(id), rejectReason);
      
      setSuccessMessage('申請を却下しました。');
      setRejectDialogOpen(false);
      
      // 申請データを再取得
      const response = await requestService.getRequestById(Number(id));
      setRequest(response.data);
      
      setProcessing(false);
    } catch (err: any) {
      setError(err.message || '申請の却下に失敗しました。');
      setProcessing(false);
    }
  };
  
  // 申請取り消しハンドラ
  const handleCancelRequest = async () => {
    if (!id || !request) return;
    
    if (!window.confirm('この申請を取り消しますか？')) {
      return;
    }
    
    try {
      setLoading(true);
      await requestService.cancelRequest(Number(id));
      
      setSuccessMessage('申請が取り消されました。');
      
      // 一覧ページに戻る
      setTimeout(() => {
        navigate('/requests', { state: { success: '申請が取り消されました。' } });
      }, 1500);
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
        return <Chip label="審査中" color="warning" />;
      case 'approved':
        return <Chip label="承認済" color="success" />;
      case 'rejected':
        return <Chip label="却下" color="error" />;
      default:
        return <Chip label="不明" />;
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/requests')}
          sx={{ mb: 2 }}
        >
          一覧に戻る
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  if (!request) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/requests')}
          sx={{ mb: 2 }}
        >
          一覧に戻る
        </Button>
        <Alert severity="warning">申請データが見つかりません。</Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/requests')}
        sx={{ mb: 2 }}
      >
        一覧に戻る
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom>
        変更申請詳細
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            申請ID: {request.id}
          </Typography>
          {getStatusChip(request.status)}
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              申請者情報
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1">
                氏名: {request.requestedByUser?.name || '不明'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                申請日時: {new Date(request.createdAt).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          
          {request.status !== 'pending' && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                処理者情報
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body1">
                  氏名: {request.processedByUser?.name || '不明'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  処理日時: {request.processedAt ? new Date(request.processedAt).toLocaleString() : '未処理'}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          変更内容
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              変更前
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1">
                科目: {request.originalSchedule?.subject?.name || '不明'}
              </Typography>
              <Typography variant="body1">
                クラス: {request.originalSchedule?.class?.name || '不明'}
              </Typography>
              <Typography variant="body1">
                曜日・時限: {getDayOfWeekLabel(request.originalSchedule?.dayOfWeek || 0)}曜日 {request.originalSchedule?.period?.name || ''}
              </Typography>
              <Typography variant="body1">
                教室: {request.originalSchedule?.rooms?.map(r => r.name).join(', ') || '未設定'}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              変更後
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1">
                科目: {request.originalSchedule?.subject?.name || '不明'}
              </Typography>
              <Typography variant="body1">
                クラス: {request.originalSchedule?.class?.name || '不明'}
              </Typography>
              <Typography variant="body1">
                曜日・時限: {getDayOfWeekLabel(request.newDayOfWeek)}曜日 {request.newPeriod?.name || ''}
              </Typography>
              <Typography variant="body1">
                教室: {request.newRooms?.map(r => r.name).join(', ') || '未設定'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            変更理由
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body1">
              {request.reason}
            </Typography>
          </Paper>
        </Box>
        
        {request.status === 'approved' && request.comment && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              承認コメント
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1">
                {request.comment}
              </Typography>
            </Paper>
          </Box>
        )}
        
        {request.status === 'rejected' && request.rejectReason && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              却下理由
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'error.light' }}>
              <Typography variant="body1">
                {request.rejectReason}
              </Typography>
            </Paper>
          </Box>
        )}
        
        {/* アクションボタン */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {/* 審査中の申請のみ取り消し可能（申請者本人のみ） */}
          {request.status === 'pending' && 
           request.requestedByUserId === authState.user?.id && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelRequest}
            >
              申請を取り消す
            </Button>
          )}
          
          {/* 管理者のみ承認/却下ボタンを表示 */}
          {request.status === 'pending' && authState.user?.role === 'admin' && (
            <>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleOpenRejectDialog}
              >
                却下
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleOpenApproveDialog}
              >
                承認
              </Button>
            </>
          )}
        </Box>
      </Paper>
      
      {/* 承認ダイアログ */}
      <Dialog open={approveDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>申請を承認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            この変更申請を承認します。承認後は元に戻せません。
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="コメント（任意）"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={processing}>
            キャンセル
          </Button>
          <Button 
            onClick={handleApprove} 
            color="success" 
            variant="contained"
            disabled={processing}
          >
            {processing ? <CircularProgress size={24} /> : '承認する'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 却下ダイアログ */}
      <Dialog open={rejectDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>申請を却下</DialogTitle>
        <DialogContent>
          <DialogContentText>
            この変更申請を却下します。却下後は元に戻せません。
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rejectReason"
            label="却下理由 *"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            error={rejectDialogOpen && !rejectReason}
            helperText={rejectDialogOpen && !rejectReason ? "却下理由は必須です" : ""}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} disabled={processing}>
            キャンセル
          </Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={processing || !rejectReason}
          >
            {processing ? <CircularProgress size={24} /> : '却下する'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
