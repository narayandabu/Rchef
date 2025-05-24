// Sidebar.jsx
import React, { useState, useRef, useEffect } from "react";
import "./styles/side_bar.css";
import axiosInstance from './utils/axiosInstance';
import NavBar from './navbar.jsx';
import { useNavigate } from 'react-router-dom';

const Side_bar = ({ setCurrentTool }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const tools = [
    { name: "Sentiment", route: "/main/chat" },
    { name: "Gemini", route: "/main/gemini" },
    { name: "Analyzer", route: "/main/analyze" },
    { name: "Papers", route: "/main/papers" }
  ];

  const sendToolType = (tool) => {
    axiosInstance.post('http://localhost:5000/api/type', { button_type: tool })
      .catch(err => console.error('Error sending tool type:', err));
  };

  const handleButtonClick = (index) => {
    const { name, route } = tools[index];
    setSelected(index);
    sendToolType(name);
    setCurrentTool(name);
    navigate(route);
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target) && !e.target.closest(".menu_button")) {
        closeSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <NavBar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <aside ref={sidebarRef} className={`side-menu-bar ${isOpen ? "open" : ""}`}>
        <h2 className="side-bar-title">Choose Mode</h2>
        <ul className="side-menu-list">
          {tools.map((tool, index) => (
            <button
              key={index}
              className={selected === index ? "selected" : ""}
              onClick={() => handleButtonClick(index)}
            >
              {tool.name}
            </button>
          ))}
        </ul>
        {selected === 3 && <div className="Link-Request open"></div>}
      </aside>
    </>
  );
};

export default Side_bar;
