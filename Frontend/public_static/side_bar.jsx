import React, { useState, useRef, useEffect } from "react";
import "./styles/side_bar.css";
import axiosInstance from './utils/axiosInstance';
import NavBar from './navbar.jsx';

const Side_bar = ({ setCurrentTool }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const sidebarRef = useRef(null);

  const button_names = ["Sentiment", "Gemini", "Analyzer", "Papers"];
  const button_funcs = [
    () => sendToolType('Sentiment'),
    () => sendToolType('Gemini'),
    () => sendToolType('Analyzer'),
    () => sendToolType('Papers'),
  ];

  const sendToolType = (tool) => {
    axiosInstance.post('http://localhost:5000/api/type', { button_type: tool })
      .catch(err => console.error('Error sending tool type:', err));
  };

  const handleButtonClick = (index, func) => {
    setSelected(index);
    func();
    setCurrentTool(button_names[index]);
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
          {button_names.map((label, index) => (
            <button
              key={index}
              className={selected === index ? "selected" : ""}
              onClick={() => handleButtonClick(index, button_funcs[index])}
            >
              {label}
            </button>
          ))}
        </ul>
        {selected === 3 && <div className="Link-Request open"></div>}
      </aside>
    </>
  );
};

export default Side_bar;
