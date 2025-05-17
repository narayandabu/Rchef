# 📚 ResearchMate — Your Personalized Research Copilot

ResearchMate is a web-based platform designed to assist researchers, students, and developers in navigating, understanding, and organizing academic content. It offers a clean, chat-first interface backed by NLP models, paper summarization, and PDF/link analysis — all tailored to boost research productivity.

---

## 🚀 Features Implemented

### 🔐 User Authentication
- Secure user login/signup system using JWT-based session handling
- Passwords hashed and stored securely
- Token expiry awareness on the frontend for seamless UX

### 💬 AI Chat Interface
- Dynamic, memory-persistent chat system using advanced language models
- Chat messages stored per user in a dedicated SQLite database
- Tool-specific context switch (e.g., General Chat, Analyze Mode)

### 📄 Document & Link Analyzer (Analyze Mode)
- Upload PDFs or paste research links (e.g., arXiv, Semantic Scholar)
- Auto-detects input type and extracts:
  - Summary
  - Metadata (title, authors, abstract, etc.)
  - Structured Q&A
- Separate chat interface for each analysis session

### 🧠 Session-Based Memory
- All chat interactions (general or analysis-based) are stored in per-user databases
- Sidebar interface to manage sessions:
  - Create new sessions
  - Rename, view, and switch between sessions
  - Maintain continuity across sessions

### 🗃️ Organized User File System
- Each user has a dedicated backend folder under `database/users/`
- Stores:
  - `chats.db` for general conversations
  - `analyzechats.db` for document and link analysis history
  - Uploaded PDFs under `uploads/`

### 📰 Research Paper Feed (Phase 1)
- Fetches recent papers from arXiv via backend cron job
- Stores paper metadata (title, abstract, authors, categories, source)
- Basic endpoint to serve a paper feed for future UI integration

---

## 🛠️ Tech Stack

**Frontend**
- React + TailwindCSS
- Axios for API requests
- `react-router-dom` for page routing

**Backend**
- Express.js + Node.js
- SQLite for local, per-user data storage
- JWT for authentication
- Multer for file uploads
- Schedule-based data fetching for arXiv content

**ML/NLP**
- HuggingFace Transformers (BERT/BART)
- Custom TensorFlow model wrappers
- Summary + Q&A pipelines for PDF/link content

---

## 📁 Project Structure (Backend)
project/
│
├── backend/
│ ├── app.js
│ ├── routes/
│ │ ├── auth.js
│ │ ├── chat.js
│ │ ├── analyzer.js
│ │ └── papers.js
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── chatController.js
│ │ ├── analyzerChatController.js
│ │ └── paperAggregator.js
│ └── database/
│ └── users/
│ └── <user_email>/
│ ├── chats.db
│ ├── analyzechats.db
│ └── uploads/
│
└── frontend/
├── components/
│ ├── ChatArea.jsx
│ ├── AnalyzeChatArea.jsx
│ ├── Sidebar.jsx
│ └── PapersPage.jsx
├── pages/
│ ├── Login.jsx
│ ├── AnalyzePage.jsx
│ └── MainChat.jsx
└── App.js
