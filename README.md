
# 🧠 AI-Driven Tutor (GenAI EdTech App)

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

### Installation(Important!) — Secure Setup

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

   * This project uses **environment variables** to keep all API keys secure.

   ## **① Create a `.env` file (do NOT commit this file)**

   Inside the project root, create a file named:

   `.env`

   Add the following environment variables:


   ```
   VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY

   VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
   VITE_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
   ```

   > 🔒 **Important:**
   >
   > `.env` is ignored by Git, so your API keys will NOT be pushed to GitHub.
   >

   ## **③ Ensure `.env` is ignored by Git**

   Your `.gitignore` should include:

   ```
   .env
   ```

   ---

   ## **④ Start the App**

   `npm run dev`

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
* [ ] **Phase 3: Develop other mode** *- pending*

## 👨‍💻 Author

**NG Ka Ming**

* Final Year Student @ EdUHK (AI & Educational Technology)
* [LinkedIn Profile](www.linkedin.com/in/ka-ming-ng-861a35389)
