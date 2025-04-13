import {Alert, 
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Divider,Grid, Paper, 
  TextField, Typography 
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/scheduleService';
import { ChangeRequest } from '../../types';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [request, setRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ダイアログの状態
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // 申請詳細の取得
  useEffect(() => {
    const fetchRequestDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await requestService.getRequestById(Number(id));
        setRequest(response.data || null);
        setLoading(false);
      } catch (err) {
        setError('変更申請の取得に失敗しました。');
        setLoading(false);
        console.error('Request detail fetch error:', err);
      }
    };

    fetchRequestDetail();
  }, [id]);

  // 承認ダイアログを開く
  const handleOpenApproveDialog = () => {
    setApproveDialogOpen(true);
    setActionError(null);
  };

  // 却下ダイアログを開く
  const handleOpenRejectDialog = () => {
    setRejectDialogOpen(true);
    setActionError(null);
  };

  // 取消ダイアログを開く
  const handleOpenCancelDialog = () => {
    setCancelDialogOpen(true);
    setActionError(null);
  };

  // ダイアログを閉じる
  const handleCloseDialogs = () => {
    setApproveDialogOpen(false);
    setRejectDialogOpen(false);
    setCancelDialogOpen(false);
    setComment('');
    setRejectReason('');
    setActionError(null);
  };

  // 申請を承認する
  const handleApprove = async () => {
    if (!id) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      
      await requestService.approveRequest(Number(id), comment);
      handleCloseDialogs();
      
      // 申請詳細を再取得
      const response = await requestService.getRequestById(Number(id));
      setRequest(response.data || null);
      
      setActionLoading(false);
    } catch (err: any) {
      setActionError(err.message || '承認に失敗しました。');
      setActionLoading(false);
      console.error('Approve error:', err);
    }
  };

  // 申請を却下する
  const handleReject = async () => {
    if (!id || !rejectReason) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      
      await requestService.rejectRequest(Number(id), rejectReason);
      handleCloseDialogs();
      
      // 申請詳細を再取得
      const response = await requestService.getRequestById(Number(id));
      setRequest(response.data || null);
      
      setActionLoading(false);
    } catch (err: any) {
      setActionError(err.message || '却下に失敗しました。');
      setActionLoading(false);
      console.error('Reject error:', err);
    }
  };

  // 申請を取り消す
  const handleCancel = async () => {
    if (!id) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      
      await requestService.cancelRequest(Number(id));
      handleCloseDialogs();
      
      // 一覧ページに戻る
      navigate('/requests');
      
      setActionLoading(false);
    } catch (err: any) {
      setActionError(err.message || '取消に失敗しました。');
      setActionLoading(false);
      console.error('Cancel error:', err);
    }
  };

  // ステータスに応じたChipの色を取得
  const getStatusColor = (status: string) => {
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
  const getStatusLabel = (status: string) => {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/requests')}
          sx={{ mt: 2 }}
        >
          一覧に戻る
        </Button>
      </Box>
    );
  }
