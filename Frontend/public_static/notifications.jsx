import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './utils/axiosInstance'; // adjust if needed
import "./styles/navbar.css";

const NotificationPanel = ({ notifications, setNotifications, setShowNotifications }) => {
  const navigate = useNavigate();

  const handleClick = async (notif, index) => {
    try {
      await axiosInstance.patch(`/notifications/mark-read/${notif.id}`);
      const updated = [...notifications];
      updated.splice(index, 1);
      setNotifications(updated);
      navigate(notif.route); // Navigate to page like /papers, /gemini etc
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <div className="notification-dropdown">
      <h4>Notifications</h4>
      {notifications.length === 0 ? (
        <p className="no-notifications">No new notifications</p>
      ) : (
        <ul>
          {notifications.map((notif, index) => (
            <li
              key={index}
              className={`notif-item notif-${notif.type}`}
              onClick={() => handleClick(notif, index)}
            >
              {notif.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPanel;
