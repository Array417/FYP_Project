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
      console.error("Login Failed", error);
      alert("Login Failed, please try again.");
    }
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 4 }}>
          <PsychologyIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            AI-Driven Tutor
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Login to save your learning progress and chat history.
          </Typography>

          <Button 
            variant="contained" 
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleLogin}
            fullWidth
            sx={{ bgcolor: '#4285F4', '&:hover': { bgcolor: '#357ae8' }, py: 1.5 }}
          >
            Please sign in with Google
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;