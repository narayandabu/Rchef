import React, { useEffect, useState } from "react";
import NotificationPanel from './notifications.jsx';
import { useNavigate } from "react-router-dom";
import axiosInstance from "./utils/axiosInstance";
import "./styles/navbar.css";
import { Link } from 'react-router-dom';
import { PiToolbox } from "react-icons/pi";
import { PiToolboxFill } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
const NavBar = ({ isOpen, toggleSidebar }) => {
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
    navigate(`/main/my-profile`);  
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.account-section')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="nav-container">
      <div className="nav-left">
        <button onClick={toggleSidebar} className="menu_button">
          {isOpen ? <PiToolboxFill size={32} />: <PiToolbox size={32}/> }
        </button>
        <Link to="/" className="logo-link">
          <div className="logo-container" >
              <img src="../Logo-small.png" alt="logo" className="logo" />
              <h1 className="navb" >LabCohort</h1>
          </div>
        </Link>
      </div>
      <div className="notification-section">
          <NotificationPanel/>
      </div>
      <div className="account-section">
        <button className="account-button" onClick={toggleDropdown}>
          <CgProfile size={42} />
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
