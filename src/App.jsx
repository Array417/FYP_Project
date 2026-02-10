import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  AppBar,
  Toolbar,
  CircularProgress,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  ListItemIcon,
  Skeleton,
} from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import GavelIcon from "@mui/icons-material/Gavel"; // 辯論圖示
import PsychologyIcon from "@mui/icons-material/Psychology"; // 大腦圖示
import LogoutIcon from "@mui/icons-material/Logout"; // 登出圖示

// Firebase Auth
import { auth } from "./config";
import { onAuthStateChanged, signOut } from "firebase/auth"; // ⚠️ 記得引入 signOut

// 組件
import LoginPage from "./components/LoginPage.jsx";
import SocraticMode from "./components/SocraticMode.jsx";
import DebateMode from "./components/DebateMode.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState("home");

  // ✨ 新增：控制頭像選單的狀態
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ✨ 新增：處理點擊頭像開啟選單
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // ✨ 新增：處理關閉選單
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // ✨ 新增：處理登出
  const handleLogout = async () => {
    handleMenuClose(); // 先關閉選單
    await signOut(auth); // 執行 Firebase 登出
    // 登出後 user 變為 null，畫面會自動跳轉回 LoginPage
  };

  // 讀取中...
  if (authLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          bgcolor: "#f0f2f5",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 1. 模擬頂部 AppBar (固定高度) */}
        <Box
          sx={{
            height: 64,
            bgcolor: "#212121",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            flexShrink: 0, // 確保 AppBar 不會被壓縮
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              sx={{ bgcolor: "grey.800", mr: 2 }}
            />
            <Skeleton
              variant="text"
              width={150}
              height={30}
              sx={{ bgcolor: "grey.800" }}
            />
          </Box>
          <Skeleton
            variant="circular"
            width={32}
            height={32}
            sx={{ bgcolor: "grey.800" }}
          />
        </Box>

        {/* 2. 中間內容區：使用 flexGrow 讓它佔滿剩餘空間，並用 justifyContent 置中 */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // ✨ 關鍵：垂直置中
            alignItems: "center",
            pb: 8, // ✨ 稍微加一點底部 padding，視覺上會比正中央再高一點點（更符合美感）
          }}
        >
          <Container maxWidth="md">
            {/* 模擬標題與副標題 */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 6,
              }}
            >
              <Skeleton variant="text" width="60%" height={80} />
              <Skeleton variant="text" width="40%" height={40} />
            </Box>

            {/* 模擬卡片 */}
            <Grid
              container
              spacing={4}
              flexDirection="column"
              alignItems="center"
              sx={{
                width: { xs: "90%", md: "70%" },
                mx: "auto",
              }}
            >
              {[1, 2].map((item) => (
                <Grid item xs={12} key={item} sx={{ width: "100%" }}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardActionArea sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        <Skeleton
                          variant="circular"
                          width={80}
                          height={80}
                          sx={{ mb: 2 }}
                        />
                        <Skeleton variant="text" width="60%" height={40} />
                        <Skeleton variant="text" width="40%" height={30} />
                        <Box sx={{ mt: 2, width: "80%" }}>
                          <Skeleton variant="text" width="100%" height={20} />
                          <Skeleton variant="text" width="90%" height={20} />
                        </Box>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>
    );
  }

  // 沒登入 -> 顯示登入頁
  if (!user) {
    return <LoginPage />;
  }

  // ⚠️ 重要：記得把 user 傳給子組件，不然它們無法存檔
  if (currentView === "socratic") {
    return <SocraticMode user={user} onBack={() => setCurrentView("home")} />;
  }

  if (currentView === "debate") {
    return <DebateMode user={user} onBack={() => setCurrentView("home")} />;
  }

  // 否則顯示主頁 (Home)
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "#f0f2f5",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 頂部欄 */}
      <AppBar position="static" sx={{ bgcolor: "#212121" }}>
        <Toolbar>
          <PsychologyIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI-Driven Tutor
          </Typography>

          {/* ✨ 修改：頭像現在可以點擊並彈出選單 */}
          <Box>
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={openMenu ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? "true" : undefined}
            >
              <Avatar
                src={user.photoURL}
                alt={user.displayName}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>

            {/* 彈出式選單 */}
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={openMenu}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {/* 顯示使用者 Email (不能點擊) */}
              <MenuItem disabled>
                <Typography variant="body2">{user.email}</Typography>
              </MenuItem>

              <Divider />

              {/* 登出按鈕 */}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 中間卡片區 */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pb: 10,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            Welcome, {user.displayName}
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            paragraph
            sx={{ mb: 6 }}
          >
            Please select your learning mode
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {/* 卡片 1：蘇格拉底模式 */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                }}
              >
                <CardActionArea
                  onClick={() => setCurrentView("socratic")}
                  sx={{
                    height: "100%",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 80, color: "#1976d2", mb: 2 }} />
                  <Typography variant="h4" gutterBottom>
                    Socratic Guidance
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Step-by-Step Inquiry
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2, color: "#666" }}>
                    The AI won't give answers directly but guides you to find
                    them yourself through questioning.
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>

            {/* 卡片 2：辯論模式 */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                }}
              >
                <CardActionArea
                  onClick={() => setCurrentView("debate")}
                  sx={{
                    height: "100%",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <GavelIcon sx={{ fontSize: 80, color: "#ed6c02", mb: 2 }} />
                  <Typography variant="h4" gutterBottom>
                    Debate Mode
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Devil's Advocate
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2, color: "#666" }}>
                    The AI challenges your viewpoints and exposes logical flaws
                    to foster critical thinking.
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default App;