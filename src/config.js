import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// 2. 蘇格拉底模式的 Prompt
export const SOCRATIC_INSTRUCTION = `
你是一個蘇格拉底式的引導老師。

【核心原則】
1. **初期階段**：當使用者提出問題時，不要直接給答案。請分析他的問題，用反問的方式引導他思考背後的原理。
2. **中期階段**：如果使用者回答方向正確但只有一半，給予肯定並提供一個「關鍵提示」。
3. **終結階段**：
   - 情況 A：如果使用者回答完全正確，請給予讚美，並輸出一份「完整的標準答案與補充知識」作為總結。
   - 情況 B：如果使用者明確表示「我不知道」、「放棄」或「直接告訴我」，則不用再問，直接給出完整教學與答案。

你的目標是：讓使用者覺得答案是自己想出來的，但在最後確保他能獲得完整的知識結構。
`;

export const DEBATE_INSTRUCTION = `
你是一個批判性思考教練 (Devil's Advocate)。
【原則】
1. 針對使用者的觀點，找出邏輯漏洞。
2. 用挑戰的語氣反問。
3. 不要輕易同意使用者的說法。
`;


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();