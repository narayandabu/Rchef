import React, { useEffect,useRef, useState } from 'react';
import AnalyzeChatArea from './components/analyzeChatArea.jsx';
import SectionSidebar from './sessionsidebar.jsx';
import axiosInstance from './utils/axiosInstance';
import { v4 as uuidv4 } from 'uuid';
import './styles/analyzePage.css';
import { FiBookOpen } from "react-icons/fi";
import { MdOutlineMenuBook } from "react-icons/md";

export default function AnalyzePage() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sessionId, setSessionId] = useState(uuidv4());
  const sidebarRef = useRef(null);
  useEffect(() => {
    fetchSessions();
  }, []);
  useEffect(() => {
    const handleClickOutside = (e) => {
      const close= sidebarRef.current && !sidebarRef.current.contains(e.target) && !e.target.closest(".toggle-sidebar-btn");
      if(sidebarVisible && close) {
        setSidebarVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarVisible]);

  const fetchSessions = async () => {
    try {
      const res = await axiosInstance.get('/analyze/chats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSessions(res.data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    }
  };
  const handleSelectSection = async (sectionId) => {
    try {
      const res = await axiosInstance.get(`/analyze/history/${sectionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setActiveSectionId(sectionId);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Error loading section messages:', error);
      setMessages([]);
    }
  };
  const handleCreateNewSection = () => {
    setActiveSectionId(null);
    setMessages([]);
    setSessionId(uuidv4());
  };
  const handleFileUpload = async (file) => {
    handleSendMessage(file.name, 'user');
    const formData = new FormData();
    formData.append('pdf', file);
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/analyze/upload', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` 
      },
      });
      handleSendMessage(res.data.message, 'bot');
      setActiveSectionId(res.data.sessionName);
    } catch (error) {
      console.error('PDF upload error:', error);
      setMessages((prev) => [...prev, { text: '❌ Failed to analyze PDF.', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAnalyzeInput = async () => {
    if (!userInput.trim()) return;
    const isURL = /^https?:\/\/\S+$/i.test(userInput.trim());

    setMessages((prev) => [...prev, { text: userInput, sender: 'user' }]);
    setIsLoading(true);

    try {
      const res = await axiosInstance.post('/analyze', {
        input: userInput,
        type: isURL ? 'url' : 'text',
        session_id: sessionId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessages((prev) => [...prev, { text: res.data.response, sender: 'bot' }]);
    } catch (err) {
      console.error('Analyze error:', err);
      setMessages((prev) => [...prev, { text: 'Something went wrong analyzing your input.', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSendMessage = async (msg, sender) => {
    const timestamp = new Date().toISOString();
    const newMessage = { text: msg, sender, timestamp };
    setMessages((prev) => [...prev, newMessage]);

    if (sender === 'user') {
      setUserInput('');
    }
      try {
        await axiosInstance.post('/analyze/chat/save', {
          text: msg,
          sender,
          session_id: sessionId,
          session_name: sessionId,
          timestamp,
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      } catch (err) {
        console.error('Error saving chat:', err);
      }
      fetchSessions();
  };

  return (
    <div className="analyze-page">
      <button
        className="toggle-sidebar-btn"
        onClick={() => setSidebarVisible(!sidebarVisible)}
      >
         {sidebarVisible ? <MdOutlineMenuBook size={24} /> : <FiBookOpen size={24} />}
      </button>

      <div ref={sidebarRef} className={`analyze-sidebar ${sidebarVisible ? "hidden" : "visible"}`}>
        <div className="analyze-content">
          <SectionSidebar
            setMessages={setMessages}
            currentSectionId={activeSectionId}
            onSelectSection={handleSelectSection}
            onCreateNewSection={handleCreateNewSection}
          />
        </div>
      </div>

      <div className="analyze-main-content">
        {messages.length === 0 && (
          <div className="analyze-header">
            <h2>Analyze PDF or Web Link</h2>
            <p>Paste a link or upload a PDF and ask questions!</p>
          </div>
        )}
        <AnalyzeChatArea
          onSendMessage={handleSendMessage}
          messages={messages}
          onFileUpload={handleFileUpload}
        />
        {isLoading && <div className="analyze-loading">Analyzing...</div>}
      </div>
    </div>
  );
}
