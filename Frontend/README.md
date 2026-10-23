# ChatMate 

ChatMate is a multi-mode AI chatbot platform that allows users to interact with specialized AI assistants and chat with their own PDF documents — all while preserving conversation context across sessions.

It is built using **React + TypeScript (Vite)** on the frontend and **FastAPI + LangGraph** on the backend, with PostgreSQL-based persistent memory and optional document-based retrieval (RAG).

---

## ✨ Features

### 🧠 Multi-Mode AI Assistants

Switch between different assistant roles:

- 🩺 **Medical Assistant** – General health information (safe & non-diagnostic)
- 💻 **Programming Assistant** – Coding, debugging, APIs, system design
- ✍️ **Writing Assistant** – Drafting, rewriting, summarizing, editing
- 🌐 **General Assistant** – Casual conversation and daily help

Each mode follows strict behavior and formatting rules.

---

### 📄 Chat with PDF (Document Mode)

- Ask questions directly from document content
- Answers are restricted to the uploaded files
- Vector embeddings created per conversation
- Full data isolation between chats
- Automatic cleanup of vectors when a chat is deleted

---

### 🔁 Persistent Conversations

- Conversations stored in PostgreSQL
- Automatic chat restoration
- State managed using LangGraph checkpoints
- Multiple conversations per user

---

### 🧭 Intelligent Routing (LangGraph)

- Mode-based routing (Medical / Programming / Writing / General / PDF)
- Optional tool usage (web search)
- Optional document retrieval pipeline (RAG)
- Clean separation of:
  - persona logic
  - knowledge sources
  - memory management

---

### 🎨 Modern UI

- React + TypeScript + Tailwind CSS
- Markdown rendering for AI responses
- Proper code block formatting
- Clean chat layout with session sidebar
- Fixed navbar layout
- Responsive design

---

### 🔐 Data Safety & Isolation

- Vectors scoped by conversation
- Documents tracked using metadata
- Safe deletion lifecycle
- No cross-conversation leakage

---

## 🏗️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Markdown

### Backend
- FastAPI
- LangGraph
- LangChain
- PostgreSQL + pgvector
- Supabase (DB hosting)
- Psycopg (async)

---

