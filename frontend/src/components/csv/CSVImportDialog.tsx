import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { csvService, CSVImportResult } from '../../services/csvService';

interface CSVImportDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'subjects' | 'timetables';
  title: string;
}

export const CSVImportDialog: React.FC<CSVImportDialogProps> = ({
  open,
  onClose,
  type,
  title
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CSVImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('CSVファイルを選択してください');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('ファイルサイズは10MB以下にしてください');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      let importResult: CSVImportResult;
      
      if (type === 'subjects') {
        importResult = await csvService.importSubjects(selectedFile, setProgress);
      } else {
        importResult = await csvService.importTimetables(selectedFile, setProgress);
      }

      setResult(importResult);
    } catch (err: any) {
      setError(err.message || 'インポートに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {type === 'subjects' 
              ? '担当者データのCSVファイルをアップロードしてください。'
              : '時間割データのCSVファイルをアップロードしてください。'
            }
          </Typography>
          
          <Box
            sx={{
              border: '2px dashed',
              borderColor: selectedFile ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: selectedFile ? 'primary.50' : 'grey.50',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50'
              }
            }}
            component="label"
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              {selectedFile ? selectedFile.name : 'CSVファイルを選択'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              クリックしてファイルを選択するか、ドラッグ&ドロップしてください
            </Typography>
          </Box>
        </Box>

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              アップロード中... {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mb: 2 }}>
            <Alert severity={result.success ? 'success' : 'warning'} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                インポート結果
              </Typography>
              <Typography variant="body2">
                総行数: {result.total_rows}行 / 
                処理済み: {result.processed_rows}行 / 
                エラー: {result.error_rows.length}行
              </Typography>
            </Alert>

            {result.error_rows.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  エラー詳細:
                </Typography>
                <List dense>
                  {result.error_rows.slice(0, 10).map((errorRow, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label={`${errorRow.row}行目`} size="small" color="error" />
                              <Typography variant="body2">
                                {errorRow.error}
                              </Typography>
                            </Box>
                          }
                          secondary={errorRow.data}
                        />
                      </ListItem>
                      {index < Math.min(result.error_rows.length, 10) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  {result.error_rows.length > 10 && (
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color="text.secondary">
                            他 {result.error_rows.length - 10} 件のエラーがあります
                          </Typography>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          閉じる
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || uploading}
          startIcon={<CloudUploadIcon />}
        >
          {uploading ? 'アップロード中...' : 'インポート実行'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
