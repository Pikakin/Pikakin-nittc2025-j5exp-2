import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';

export const RequestDetailPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          申請詳細
        </Typography>
        <Alert severity="info">
          申請詳細機能は今後実装予定です。
        </Alert>
      </Box>
    </Container>
  );
};
