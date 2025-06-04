import './styles/paper.css'; // Create this CSS file for styling
import axiosInstance from './utils/axiosInstance'; 
import { useState } from 'react';
import LikeButton from './like_button.jsx'; // Import the LikeButton component
import { formatLikeCount } from './utils/formatLikes';

const PaperPreviewModal = ({ paper, onClose }) => {
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const handleAnalyzePaper = async (paper) => {
    const sessionId = crypto.randomUUID(); // same as uuidv4
    try {
      const prompt = `Analyze the following paper and summarize its key contributions:\n\nTitle: ${paper.title}\n\nAbstract: ${paper.abstract}`;
      // Optional: store initial bot message in session history
      await axiosInstance.post('/analyze/chat/save', {
        text: prompt,
        sender: 'user',
        session_id: sessionId,
        session_name: paper.title || paper.authors || 'Test_Paper',
        timestamp: new Date().toISOString(),
      });
      showFeedbackMessage("Analyzing paper and creating a session...");
    } catch (err) {
      console.error('Failed to analyze paper:', err);
    }
  };
  const showFeedbackMessage = (msg, duration = 2000) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(''), duration);
  };
  if (!paper) return null;
  return (
    <div className="paper-preview-overlay" onClick={onClose}>
      <div className="paper-preview-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="preview-title">{paper.title}  
          </h2>
        <p className="preview-abstract"><strong>Abstract: </strong>{paper.abstract}</p>
        <div className="preview-meta">
          <p><strong>Authors:</strong> {paper.authors}</p>
          <p><strong>Journal:</strong> {paper.journal} ({paper.year})</p>
          <p><strong>Source:</strong> {paper.source}</p>
          {paper.tags && (
            <p><strong>Tags:</strong> {paper.tags}</p>
          )}
          <div className='paper-action-btns'>
          {paper.link && (
            <p><a href={paper.link} target="_blank" rel="noopener noreferrer" className="original_link">🔗 View Original</a></p>
          )}
          <button className="analyze-btn" onClick={()=>handleAnalyzePaper(paper)}>Analyze</button>
          <LikeButton paper={paper} paperId={paper.id} className='preview'/>
        </div>
        {feedbackMessage && (
          <div className="feedback-popup">{feedbackMessage}</div>
        )}
      </div>
      </div>

    </div>
  );
};

export default PaperPreviewModal;
