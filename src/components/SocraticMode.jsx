import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

import {
  Box, TextField, Button, Paper, Typography, Avatar, CircularProgress,
  List, ListItemButton, ListItemText, Divider, IconButton, AppBar, Toolbar
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { GEMINI_API_KEY, SOCRATIC_INSTRUCTION } from '../config';
import { db } from '../config';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, deleteDoc
} from 'firebase/firestore';

function SocraticMode({ onBack, user }) {
  const [messages, setMessages] = useState([{ role: 'model', text: "你好！我是你的思考導師 Gemini。" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const [chatTitle, setChatTitle] = useState("");

  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setChatList(items);

      if (selectedChatId && !items.find(c => c.id === selectedChatId)) {
        handleNewChat();
      }
    }, (err) => {
      console.error("載入聊天清單失敗", err);
    });

    return () => unsubscribe();
  }, [user, selectedChatId]);

  //  new chat
  const handleNewChat = () => {
    setSelectedChatId(null);
    setChatTitle("");
    setMessages([{ role: 'model', text: "你好！我是你的思考導師 Gemini。" }]);
  };

  // 歷史對話
  const handleSelectChat = (chat) => {
    setSelectedChatId(chat.id);
    if (Array.isArray(chat.messages) && chat.messages.length) {
      setMessages(chat.messages);
    } else {
      setMessages([{ role: 'model', text: "（此對話目前沒有訊息）" }]);
    }
  };

  // 刪除聊天
  const handleDeleteChat = async (chatId) => {
    if (!chatId) return;
    try {
      await deleteDoc(doc(db, 'chats', chatId));
      if (selectedChatId === chatId) handleNewChat();
    } catch (err) {
      console.error("刪除失敗", err);
    }
  };

  // 發送訊息 + 自動儲存
  // 在 handleSend 裡面
  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // 更新前端訊息
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);

    try {
      let currentChatId = selectedChatId;
      let title = chatTitle;

      // 第一次發送，創建新的 chat document
      if (!currentChatId) {

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const titleResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{
            role: "user",
            parts: [{ text: `請幫我為這條訊息生成一句簡短的單一標題，不超過7個字，不加其他說明：${userMessage}` }]
          }]
        });
        title = titleResponse.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 50) || userMessage.slice(0, 50) || "新對話";

        const payload = {
          userId: user.uid,
          title,
          messages: [{ role: 'user', text: userMessage }],
          createdAt: serverTimestamp()
        };
        const ref = await addDoc(collection(db, 'chats'), payload);
        currentChatId = ref.id;
        setSelectedChatId(ref.id);
        setChatTitle(title); // 更新 AppBar 顯示
      } else {
        // 已有 chat document → 更新 messages
        const chatRef = doc(db, 'chats', currentChatId);
        await updateDoc(chatRef, {
          messages: newMessages,
          updatedAt: serverTimestamp()
        });
      }

      // 呼叫 AI 回覆
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const conversationHistory = newMessages.map(m =>
        `${m.role === 'user' ? 'User' : 'Model'}: ${m.text}`
      ).join('\n');

      const fullPrompt = `
${SOCRATIC_INSTRUCTION}

以下是目前的對話紀錄：
${conversationHistory}
User: ${userMessage}
Model:
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
      });

      const aiText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const messagesWithAI = [...newMessages, { role: 'model', text: aiText }];
      setMessages(messagesWithAI);

      // 更新 AI 回覆到 Firestore
      const chatRef = doc(db, 'chats', currentChatId);
      await updateDoc(chatRef, {
        messages: messagesWithAI,
        updatedAt: serverTimestamp()
      });

    } catch (err) {
      console.error("發送/儲存失敗", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <SmartToyIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{`模式 A：蘇格拉底引導${chatTitle ? ' - ' + chatTitle : ''}`}</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左側 Sidebar */}
        <Box sx={{ width: 260, borderRight: '1px solid #ddd', p: 2, bgcolor: '#fff', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} fullWidth onClick={handleNewChat}>新對話</Button>
          <Divider />
          <Typography variant="subtitle1" sx={{ color: 'black' }}>歷史對話</Typography>
          <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {chatList.map(chat => (
              <ListItemButton key={chat.id} selected={selectedChatId === chat.id} onClick={() => handleSelectChat(chat)}>
                <ListItemText primary={chat.title || "未命名"} secondary={chat.createdAt?.toDate?.().toLocaleString?.() || ""} primaryTypographyProps={{ color: 'black' }} />
                <IconButton edge="end" onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* 右側 ChatBox */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((msg, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 1 }}>
                {msg.role === 'model' && <Avatar sx={{ bgcolor: '#1976d2' }}><SmartToyIcon /></Avatar>}
                <Paper elevation={1} sx={{ p: 2, maxWidth: '70%', borderRadius: 2, bgcolor: msg.role === 'user' ? '#e3f2fd' : '#ffffff' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                </Paper>
                {msg.role === 'user' && <Avatar sx={{ bgcolor: '#ff9800' }}><PersonIcon /></Avatar>}
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography sx={{ color: '#000' }}>思考中...</Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Paper elevation={3} sx={{ p: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth variant="outlined" placeholder="輸入你的想法..."
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(); }}
              disabled={loading} size="small"
            />
            <Button variant="contained" endIcon={<SendIcon />} onClick={handleSend} disabled={loading}>send</Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default SocraticMode;