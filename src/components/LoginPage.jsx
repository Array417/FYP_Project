import { Box, Button, Paper, Typography, Container } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { auth, googleProvider } from '../config';
import { signInWithPopup } from 'firebase/auth';

function LoginPage() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("登入失敗", error);
      alert("登入失敗，請重試");
    }
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 4 }}>
          <PsychologyIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            生成式 AI 思維訓練系統
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            請登入以儲存您的學習進度與對話紀錄
          </Typography>

          <Button 
            variant="contained" 
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleLogin}
            fullWidth
            sx={{ bgcolor: '#4285F4', '&:hover': { bgcolor: '#357ae8' }, py: 1.5 }}
          >
            使用 Google 帳號登入
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;