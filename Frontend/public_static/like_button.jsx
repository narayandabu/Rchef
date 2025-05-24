import { useEffect, useState } from 'react';
import axiosInstance from './utils/axiosInstance'; 
import { FaHeart } from 'react-icons/fa';
import './styles/LikeButton.css';
import { formatLikeCount } from './utils/formatLikes';

const LikeButton = ({ paper,paperId, className = '', style = {} }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(paper?.like_count || 0);
  const [splash, setSplash] = useState(false);
  useEffect(() => {
    if (paperId) {
      axiosInstance.get(`/papers/isLiked/${paperId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => setLiked(res.data.liked))
        .catch(err => console.error('Error fetching like state', err));
    }
  }, [paperId]);

  const toggleLike = async() => {
    const newLiked = !liked;
    const newCount = likeCount + (newLiked ? 1 : -1);
    setLiked(newLiked);
    setLikeCount(newCount);
    if (newLiked) {
      setSplash(true);
      setTimeout(() => setSplash(false), 400); // Reset splash after animation
    }
   try {
      const res = await axiosInstance.post(`/papers/toggleLike/${paperId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Server might return actual like state
      if (res?.data?.liked !== undefined && res.data.liked !== newLiked) {
        setLiked(res.data.liked);
        setLikeCount(likeCount); // rollback to original count
      }

    } catch (err) {
      // Rollback UI if request fails
      console.error('Failed to toggle like', err);
      setLiked(!newLiked);
      setLikeCount(likeCount); // rollback
    }
  };

  return (
    <div className={`like-button-container-${className}`}>
      <button
        onClick={(e) => {
          e.stopPropagation(); 
          toggleLike();
        }}
        className={`like-button ${splash ? 'splash' : ''}`}
        style={style}
        title={liked ? 'Unlike' : 'Like'}
      >
        <FaHeart color={liked ? 'red' : 'gray'} />
        {splash && <span className="splash-effect"></span>}
      </button>
      <span className="likes-count">
        {formatLikeCount(likeCount)} {likeCount > 1 ? 'likes' : 'like'}
      </span>
    </div>
  );
};

export default LikeButton;
