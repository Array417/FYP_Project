import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

import {
  Box, TextField, Button, Paper, Typography, Avatar, CircularProgress,
  List, ListItemButton, ListItemText, Divider, IconButton, AppBar, Toolbar, Chip, Stack
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import AttachFileIcon from '@mui/icons-material/AttachFile'; // ✨ 新增迴紋針圖示
import CloseIcon from '@mui/icons-material/Close'; // ✨ 新增關閉圖示

import { GEMINI_API_KEY, SOCRATIC_INSTRUCTION } from '../config';
import { db } from '../config';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, deleteDoc
} from 'firebase/firestore';

function SocraticMode({ onBack, user }) {
  const [messages, setMessages] = useState([{ role: 'model', text: "Hello！I am your Tutor。" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const [chatTitle, setChatTitle] = useState("");

  // ✨ 新增：儲存使用者選取的 PDF 檔案 (尚未發送)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null); // 用來控制隱藏的 input

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
    setMessages([{ role: 'model', text: "Hello！I am your Tutor。" }]);
    setSelectedFiles([]);
  };

  // 歷史對話
  const handleSelectChat = (chat) => {
    setSelectedChatId(chat.id);
    setSelectedFiles([]);
    setChatTitle(chat.title || ""); 
    if (Array.isArray(chat.messages) && chat.messages.length) {
      setMessages(chat.messages);
    } else {
      setMessages([{ role: 'model', text: "（no messages in this chat.）" }]);
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

  // ✨ 新增：處理檔案選擇
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    // 過濾非 PDF (雖然 input accept 擋了一層，但多做檢查比較保險)
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...pdfFiles]);
    }
  };

  // ✨ 新增：移除已選檔案
  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // ✨ 新增：將檔案轉為 Base64 (Gemini 需要的格式)
  const fileToGenerativePart = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 發送訊息 + 自動儲存
  // 在 handleSend 裡面
  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || !user) return;

    const userMessage = input;
    const filesToSend = [...selectedFiles];

    setInput('');
    setSelectedFiles([]);
    setLoading(true);

    // 顯示在 UI 的訊息 (不含 Base64，只含檔名)
    let displayMessageText = userMessage;
    if (filesToSend.length > 0) {
      const fileNames = filesToSend.map(f => `[📄 ${f.name}]`).join(' ');
      displayMessageText = `${userMessage}\n${fileNames}`.trim();
    }

    // 更新前端訊息
    const newMessages = [...messages, { role: 'user', text: displayMessageText }];
    setMessages(newMessages);

    try {
      let currentChatId = selectedChatId;
      let title = chatTitle;
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      // --- 1. 處理新對話標題 ---
      if (!currentChatId) {
        const titlePrompt = userMessage || "PDF Analysis";
        
        // 產生標題時不需要傳送 PDF，純文字即可
        const titleResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash", 
          contents: [{
            role: "user",
            parts: [{ text: `請幫我為這條訊息生成一句簡短的單一標題使用英文，不超過7個字，不加其他說明：${titlePrompt}` }]
          }]
        });
        
        title = titleResponse.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 50) || "New Chat";

        const payload = {
          userId: user.uid,
          title,
          messages: [{ role: 'user', text: displayMessageText }],
          createdAt: serverTimestamp()
        };
        const ref = await addDoc(collection(db, 'chats'), payload);
        currentChatId = ref.id;
        setSelectedChatId(ref.id);
        setChatTitle(title);
      } else {
        // 已有 chat document → 更新 messages
        const chatRef = doc(db, 'chats', currentChatId);
        await updateDoc(chatRef, {
          messages: newMessages,
          updatedAt: serverTimestamp()
        });
      }

      // --- 2. 準備 Prompt 與 檔案 ---
      
      const historyParts = newMessages.slice(0, -1).map(m => 
        `${m.role === 'user' ? 'User' : 'Model'}: ${m.text}`
      ).join('\n');

      const fullPromptText = `
${SOCRATIC_INSTRUCTION}

Conversation History:
${historyParts}

Current User Input: ${userMessage}
(The user may have attached documents. Please answer based on them if present.)
`;

      // ✨ 修正點 A：建立 parts 陣列
      const currentParts = [{ text: fullPromptText }];
      
      // 處理 PDF 轉 Base64 並加入 parts
      if (filesToSend.length > 0) {
        for (const file of filesToSend) {
          const filePart = await fileToGenerativePart(file);
          currentParts.push(filePart);
        }
      }

      // --- 3. 呼叫 Gemini ---
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: currentParts }] // ✨ 修正點 C：這裡傳入 currentParts (包含 PDF)，而不是未定義的 fullPrompt
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
      alert("Error: " + err.message);
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
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{`Socratic Mode${chatTitle ? ' - ' + chatTitle : ''}`}</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <Box sx={{ width: 260, borderRight: '1px solid #ddd', p: 2, bgcolor: '#fff', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} fullWidth onClick={handleNewChat}>New Chat</Button>
          <Divider />
          <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {chatList.map(chat => (
              <ListItemButton key={chat.id} selected={selectedChatId === chat.id} onClick={() => handleSelectChat(chat)}>
                <ListItemText 
                  primary={chat.title || "Untitled"} 
                  secondary={chat.createdAt?.toDate?.().toLocaleString?.() || ""} 
                  primaryTypographyProps={{ noWrap: true, color: 'black' }} // 防止標題過長
                />
                <IconButton edge="end" onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Chat Area */}
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
                <Typography sx={{ color: '#000' }}>Analyzing Docs & Thinking...</Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            
            {/* ✨ 新增：顯示已選擇的檔案 */}
            {selectedFiles.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                {selectedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    icon={<AttachFileIcon />}
                    label={file.name}
                    onDelete={() => handleRemoveFile(index)}
                    deleteIcon={<CloseIcon />}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* ✨ 新增：隱藏的 input 和 迴紋針按鈕 */}
              <input
                type="file"
                multiple
                accept="application/pdf"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <IconButton color="primary" onClick={() => fileInputRef.current.click()} disabled={loading}>
                <AttachFileIcon />
              </IconButton>

              <TextField
                fullWidth variant="outlined" 
                placeholder={selectedFiles.length > 0 ? "Ask questions about the PDF..." : "Type your message..."}
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(); }}
                disabled={loading} size="small"
                multiline maxRows={3} // 允許輸入多行
              />
              <Button variant="contained" endIcon={<SendIcon />} onClick={handleSend} disabled={loading || (!input.trim() && selectedFiles.length === 0)}>
                send
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}


export default SocraticMode;