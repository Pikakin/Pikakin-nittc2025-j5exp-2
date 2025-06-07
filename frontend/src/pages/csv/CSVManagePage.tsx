import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { CSVImportDialog } from '../../components/csv/CSVImportDialog';
import { csvService } from '../../services/csvService';

export const CSVManagePage: React.FC = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState<'subjects' | 'timetables'>('subjects');
  const [exportGrade, setExportGrade] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImportClick = (type: 'subjects' | 'timetables') => {
    setImportType(type);
    setImportDialogOpen(true);
  };

  const handleExport = async (type: 'subjects' | 'timetables') => {
    setLoading(true);
    setMessage(null);

    try {
      const filter = exportGrade ? { grade: Number(exportGrade) } : undefined;
      let blob: Blob;

      if (type === 'subjects') {
        blob = await csvService.exportSubjects(filter);
      } else {
        blob = await csvService.exportTimetables(filter);
      }

      // ファイルダウンロード
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage({
        type: 'success',
        text: `${type === 'subjects' ? '担当者' : '時間割'}データのエクスポートが完了しました`
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'エクスポートに失敗しました'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        CSV管理
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* インポートセクション */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUploadIcon />
              CSVインポート
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      担当者データ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      科目コード、クラス、実施場所、科目名、勤務形態、教員情報をインポートします。
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => handleImportClick('subjects')}
                    >
                      担当者CSVインポート
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      時間割データ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      クラス別の週間時間割データをインポートします。
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      onClick={() => handleImportClick('timetables')}
                    >
                      時間割CSVインポート
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* エクスポートセクション */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudDownloadIcon />
              CSVエクスポート
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>学年フィルター</InputLabel>
                <Select
                  value={exportGrade}
                  label="学年フィルター"
                  onChange={(e) => setExportGrade(e.target.value as number | '')}
                >
                  <MenuItem value="">全学年</MenuItem>
                  <MenuItem value={1}>1年</MenuItem>
                  <MenuItem value={2}>2年</MenuItem>
                  <MenuItem value={3}>3年</MenuItem>
                  <MenuItem value={4}>4年</MenuItem>
                  <MenuItem value={5}>5年</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      担当者データ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      現在の担当者データをCSV形式でエクスポートします。
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="outlined"
                      startIcon={<CloudDownloadIcon />}
                      onClick={() => handleExport('subjects')}
                      disabled={loading}
                    >
                      担当者CSVエクスポート
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      時間割データ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      現在の時間割データをCSV形式でエクスポートします。
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="outlined"
                      startIcon={<CloudDownloadIcon />}
                      onClick={() => handleExport('timetables')}
                      disabled={loading}
                    >
                      時間割CSVエクスポート
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 使用方法セクション */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon />
              CSV形式について
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  担当者CSVフォーマット
                </Typography>
                <Box component="pre" sx={{ 
                  bgcolor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1, 
                  fontSize: '0.875rem',
                  overflow: 'auto'
                }}>
{`科目コード,クラス,実施場所,科目,勤務形態,教員１,教員２,教員３
110001,1-1,1-1HR,英語1A,常勤,英語太郎,,
110002,1-1,体育館,体育1,常勤,体育太郎,体育次郎,
150014,1-5,コンピュータ室,情報,非常勤,情報太郎,,`}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  時間割CSVフォーマット
                </Typography>
                <Box component="pre" sx={{ 
                  bgcolor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1, 
                  fontSize: '0.875rem',
                  overflow: 'auto'
                }}>
{`クラス,月１,月２,月３,月４,火１,火２,火３,火４,水１,水２,水３,水４,木１,木２,木３,木４,金１,金２,金３,金４
1-1,英語1A,数学1,国語1B,空,数学1,数学1A,英語1B,HR,数学1B,英語1A,国語1A,空,国語1,国語1,地学基礎,空,数学1A,空,地理,空`}
                </Box>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>注意事項:</strong>
                <br />• CSVファイルは UTF-8 エンコーディングで保存してください
                <br />• ファイルサイズは10MB以下にしてください
                <br />• 空のセルは「空」または空白で表現してください
                <br />• エラーが発生した行は処理されません
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      <CSVImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        type={importType}
        title={importType === 'subjects' ? '担当者CSVインポート' : '時間割CSVインポート'}
      />
    </Box>
  );
};