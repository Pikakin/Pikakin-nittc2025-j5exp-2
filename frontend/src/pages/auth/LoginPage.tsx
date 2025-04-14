import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import {Alert, 
  Avatar, Box, Button, CircularProgress, 
  Container, Link, Paper,TextField, Typography 
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState, login, clearError } = useAuth();
  
  // フォーム状態
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: ''
  });
  
  // 認証済みの場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [authState.isAuthenticated, navigate]);
  
  // フォームバリデーション
  const validateForm = () => {
    let valid = true;
    const errors = {
      username: '',
      password: ''
    };
    
    if (!username.trim()) {
      errors.username = 'ユーザー名を入力してください';
      valid = false;
    }
    
    if (!password) {
      errors.password = 'パスワードを入力してください';
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  // ログイン処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // エラーをクリア
    clearError();
    
    // バリデーション
    if (!validateForm()) {
      return;
    }
    
    // ログイン実行
    await login(username, password);
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            高専スケジュールシステム
          </Typography>
          
          {authState.error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {authState.error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="ユーザー名"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={authState.loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={authState.loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={authState.loading}
            >
              {authState.loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'ログイン'
              )}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="#" variant="body2" onClick={(e) => {
                e.preventDefault();
                navigate('/forgot-password');
              }}>
                パスワードをお忘れですか？
              </Link>
            </Box>
          </Box>
        </Paper>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} 高専スケジュールシステム
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
