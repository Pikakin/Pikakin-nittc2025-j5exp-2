import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';

export const RequestCreatePage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          申請作成
        </Typography>
        <Alert severity="info">
          申請作成機能は今後実装予定です。
        </Alert>
      </Box>
    </Container>
  );
};
