import React,{useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './utils/axiosInstance';
import "./styles/navbar.css";
import { IoNotificationsOutline } from "react-icons/io5";
import { IoNotificationsSharp } from "react-icons/io5";

const NotificationPanel = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => {

    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get('/notifications');
        console.log("Fetched notifications:", res.data);
        setNotifications(res.data || []);
      }
       catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, []);
  const handleClick = async (notif, index) => {
    try {
      await axiosInstance.patch(`/notifications/mark-read/${notif.id}`);
      const updated = [...notifications];
      updated.splice(index, 1);
      setNotifications(updated);
      navigate('/main'+notif.route);
      
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  useEffect(() => {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.notification-section')) setShowNotifications(false);
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <>
      <button className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
        {showNotifications ? (<IoNotificationsSharp size={32}/>) : (<IoNotificationsOutline size={32}/> )}
        {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
      </button>
      {showNotifications &&(
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
      )}
    </>
  );
};

export default NotificationPanel;
