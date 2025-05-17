import './styles/paper.css'; // Create this CSS file for styling

const PaperPreviewModal = ({ paper, onClose }) => {
  if (!paper) return null;

  return (
    <div className="paper-preview-overlay" onClick={onClose}>
      <div className="paper-preview-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="preview-title">{paper.title}</h2>
        <p className="preview-abstract"><strong>Abstract: </strong>{paper.abstract}</p>
        <div className="preview-meta">
          <p><strong>Authors:</strong> {paper.authors}</p>
          <p><strong>Journal:</strong> {paper.journal} ({paper.year})</p>
          <p><strong>Source:</strong> {paper.source}</p>
          {paper.tags && (
            <p><strong>Tags:</strong> {paper.tags}</p>
          )}
          {paper.link && (
            <p><a href={paper.link} target="_blank" rel="noopener noreferrer" className="original_link">🔗 View Original</a></p>
          )}
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default PaperPreviewModal;
