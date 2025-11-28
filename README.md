
# 🧠 AI-Driven Socratic Tutor (GenAI EdTech App)

![Project Status](https://img.shields.io/badge/Status-Prototype-green)
![Tech Stack](https://img.shields.io/badge/Stack-React_Firebase_Gemini-blue)

## 📖 Introduction

This is a comprehensive **Educational Technology application** designed to foster critical thinking. Unlike traditional chatbots that provide direct answers, this system leverages **Google Gemini LLM** and advanced **Prompt Engineering** to guide users through the **Socratic Method**—asking probing questions to stimulate critical thinking and self-discovery.

This project was developed as a **Final Year Project (FYP)** to explore the intersection of Generative AI and Pedagogy.

## ✨ Key Features

* **🤖 Socratic Questioning Engine:** A custom-tuned AI tutor that refuses to give direct answers, instead guiding users via scaffolding questions.
* **🔄 Real-time Chat Sync:** Powered by **Firebase Firestore**, allowing chat history to sync instantly across devices using `onSnapshot` listeners.
* **🔐 Secure Authentication:** Integrated **Google OAuth** (Firebase Auth) for secure user login and session management.
* **🏷️ Smart Auto-Titling:** Analyzes the first user message using a secondary AI call to generate concise, context-aware chat titles automatically.
* **🧠 Context Awareness:** Manages the LLM context window to retain conversation history for coherent, long-term dialogue.

## 🛠️ Tech Stack

* **Frontend:** React.js, Material UI (MUI), Vite (or Create React App)
* **Backend (BaaS):** Firebase Authentication, Cloud Firestore
* **AI Integration:** Google Gemini API (`gemini-2.5-flash`) via Google GenAI SDK
* **State Management:** React Hooks (`useState`, `useEffect`, `useRef`)

## 🚀 Getting Started

### Prerequisites

* Node.js (v16 or higher)
* npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-socratic-tutor.git
   cd ai-socratic-tutor
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Configuration (Important!)**

   * Create a file named `config.js` (or `.env` if you used environment variables) in the `src` folder.
   * Add your Firebase and Gemini API credentials. *Note: This project requires your own API keys to function.*

   ```javascript
   // Example config.js structure
   export const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
   export const firebaseConfig = {
     apiKey: "YOUR_FIREBASE_API_KEY",
     // ... other firebase config
   };
   ```
4. **Run the Application**

   ```bash
   npm run dev
   # or 'npm start' depending on your setup
   ```

## 📂 Project Structure

**src/**
├── components/
│ ├── LoginPage.jsx # Google OAuth handling
│ ├── SocraticMode.jsx # Core Chat Logic & AI Integration
│ └── DebateMode.jsx # (In Development) Devil's Advocate mode
├── config.js # API Keys & Firebase Init (Not tracked by Git)
├── App.jsx # Main Router & Layout
└── main.jsx # Entry point


## 🔮 Roadmap

* [X] **Phase 1: MVP Core** (Socratic Mode, Auth, DB) - *Completed*
* [ ] **Phase 2: Debate Mode** (Devil's Advocate) - *Currently In Development*
* [ ] **Phase 3: Learning Analytics** - Dashboard for students to review their thinking patterns.

## 👨‍💻 Author

**NG Ka Ming**

* Final Year Student @ EdUHK (AI & Educational Technology)
* [LinkedIn Profile](www.linkedin.com/in/ka-ming-ng-861a35389)
