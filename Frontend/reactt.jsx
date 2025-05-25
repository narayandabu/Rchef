import { createRoot } from "react-dom/client";
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Side_bar from "./public_static/side_bar.jsx";
import LoginPage from './public_static/login.jsx';
import ProtectedRoute from './public_static/protectedroute.jsx';

import Home from "./public_static/main_page.jsx";
import Chat_area from './public_static/chat_area.jsx';
import Analyzer from './public_static/AnalyzerPage.jsx';
import Notebook from "./public_static/notes.jsx";
import PapersDisplay from './public_static/PapersDisplay.jsx'; 
import ProfilePage from './public_static/profile_page/Profilepage';

import { LuNotebookPen } from "react-icons/lu";

const container = document.getElementById("root");
const root = createRoot(container);

function MainLayout() {
  const [showNotebook, setShowNotebook] = useState(false);
  const [note, setNote] = useState('');
  const [currentTool, setCurrentTool] = useState("Sentiment");

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <Side_bar currentTool={currentTool} setCurrentTool={setCurrentTool} />
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat_area currentTool="Sentiment" />} />
          <Route path="/gemini" element={<Chat_area currentTool="Gemini" />} />
          <Route path="/analyze" element={<Analyzer />} />
          <Route path="/papers" element={<PapersDisplay />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/my-profile" element={<ProfilePage />} />
          {/* <Route path="*" element={<Navigate to="/main" replace />} /> */}
        </Routes>
      </main>

      {/* Notebook panel */}
      <Notebook
        isOpen={showNotebook}
        onClose={() => setShowNotebook(false)}
        externalNote={note}
        setExternalNote={setNote}
      />

      {/* Floating toggle button */}
      <button className="notebook-toggle" onClick={() => setShowNotebook(!showNotebook)}>
          <LuNotebookPen size={32}/>
      </button>
    </div>
  );
}

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/main/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

root.render(<Main />);
