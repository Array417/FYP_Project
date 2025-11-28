// src/DebateMode.jsx
import { Box, Button, Typography, Container, AppBar, Toolbar, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GavelIcon from '@mui/icons-material/Gavel';

function DebateMode({ onBack }) {
  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', bgcolor: '#fff3e0' }}>
      <AppBar position="static" color="warning">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <GavelIcon sx={{ mr: 2 }} />
          <Typography variant="h6">模式 B：惡魔辯論 (開發中)</Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>🚧 功能開發中</Typography>
        <Typography variant="body1">
          這裡將來會是一個「反向思考」的機器人，<br/>它會挑戰你的觀點，而不是引導你。
        </Typography>
        <Button variant="outlined" onClick={onBack} sx={{ mt: 3 }}>
          返回主頁
        </Button>
      </Container>
    </Box>
  );
}

export default DebateMode;