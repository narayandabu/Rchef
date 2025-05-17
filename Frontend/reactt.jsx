import {createRoot} from "react-dom/client"
import React, { useState } from 'react';
import Side_bar from "./public_static/side_bar.jsx";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './public_static/login.jsx';
import ProtectedRoute from './public_static/protectedroute.jsx';
import Chat_area from './public_static/chat_area.jsx';
import Analyzer from './public_static/AnalyzerPage.jsx';
import Notebook from "./public_static/notes.jsx";
import PapersDisplay from './public_static/PapersDisplay.jsx'; 
import PaperDetail from './public_static/paper.jsx';


const container = document.getElementById("root")
const root = createRoot(container)

function MainLayout() {
  const [showNotebook, setShowNotebook] = useState(false);
  const [note, setNote] = useState('');
  const [currentTool, setCurrentTool] = useState("Sentiment");
  return (
    <>
      <div className="layout-container">
      <aside className="sidebar"><Side_bar currentTool={currentTool} setCurrentTool={setCurrentTool} /></aside>
      <main className="main-content">{currentTool === "Papers" ? (
        <div className="scroll-wrapper">
          <PapersDisplay />
        </div>
        ) :currentTool==="Analyzer"? (
          <Analyzer />) 
        :(
          <Chat_area currentTool={currentTool} />
      )}
      </main>
      {/* Notebook panel */}
      <Notebook isOpen={showNotebook} 
        onClose={() => setShowNotebook(false)} 
        externalNote={note}
        setExternalNote={setNote} 
      />
      
      {/* Floating toggle button */}
      <button className="notebook-toggle" onClick={() => setShowNotebook(!showNotebook)}
        ><img src="../leftdoublearrow.png" alt="notebook-left" width="50" height="40"/>
      </button>
    </div>
    </>
  );
}
function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/main"
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

root.render(
    <Main/>
)




