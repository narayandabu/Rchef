import React, { useEffect, useState } from "react";
import NotificationPanel from './notifications.jsx';
import { useNavigate } from "react-router-dom";
import axiosInstance from "./utils/axiosInstance";
import "./styles/navbar.css";

const NavBar = ({ isOpen, toggleSidebar }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => setShowDropdown(prev => !prev);
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found.");
        navigate('/');
        return;
      }
      await axiosInstance.post('http://localhost:5000/api/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      const message = err?.response?.data?.message || 'Unknown error';
      if (message === "Invalid or expired token") {
        localStorage.removeItem('token');
        navigate('/');
      }
      console.error("Logout failed:", message);
    }
  };

  const handleViewProfile = () => {
    console.log("Viewing profile...");
    // Add logic to route or open modal
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get('/notifications');
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.account-section')) setShowDropdown(false);
      if (!e.target.closest('.notification-section')) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="nav-container">
      <div className="nav-left">
        <button onClick={toggleSidebar} className="menu_button">
          {isOpen ? "✖" : "☰"}
        </button>
        <div className="logo-container">
          <img src="../Logo-small.png" alt="logo" className="logo" />
          <h1 className="navb">NeuroLinguo</h1>
        </div>
      </div>

      <div className="notification-section">
        <button className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
          🔔
          {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
        </button>
        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            setNotifications={setNotifications}
            setShowNotifications={setShowNotifications}
          />
        )}
      </div>

      <div className="account-section">
        <button className="account-button" onClick={toggleDropdown}>
          <img src="../default-avatar.png" className="account-avatar" />
          <i className="fas fa-chevron-down"></i>
        </button>
        {showDropdown && (
          <div className="account-dropdown">
            <button title="profile" onClick={handleViewProfile}>View Profile</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
