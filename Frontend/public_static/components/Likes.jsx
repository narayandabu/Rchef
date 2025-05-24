import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import './styles/like.css'; 

const Like = ({ paperId, className = '' }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [statusRes, countRes] = await Promise.all([
          axiosInstance.get(`/api/papers/isLiked/${paperId}`, { headers }),
          axiosInstance.get(`/api/papers/likes/${paperId}`)
        ]);

        setLiked(statusRes.data.liked);
        setCount(countRes.data.count);
      } catch (err) {
        console.error("Failed to fetch like info", err);
      }
    };

    fetchLikeStatus();
  }, [paperId]);

  const handleLike = async () => {
    if (liked) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axiosInstance.post(`/api/papers/like`, { paperId }, { headers });
      setLiked(true);
      setCount(prev => prev + 1);
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  return (
    <button className={`like-button ${className}`} onClick={handleLike} disabled={liked}>
      ❤️ {liked ? "Liked" : "Like"} ({count})
    </button>
  );
};

export default Like;
