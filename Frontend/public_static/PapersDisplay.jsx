import React, { useEffect, useState } from "react";
import axiosInstance from './utils/axiosInstance';
import "./styles/papers_display.css";
import PaperPreviewModal from './paper.jsx'; // ✅ Make sure the file exists

const PapersDisplay = () => {
  const [arxivpapers, setarxivPapers] = useState([]);
  const [pubmedPapers, setPubmedPapers] = useState([]);
  const [recommendedPapers, setRecommendedPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);


  useEffect(() => {
    axiosInstance.get(`/papers/arxiv`)
    .then((res) => setarxivPapers(res.data))
    .catch((err) => console.error('Failed to fetch arXiv papers:', err));
    
    axiosInstance.get(`/papers/pubmed`)
    .then((res) => setPubmedPapers(res.data))
    .catch((err) => console.error('Failed to fetch PubMed papers:', err));
  
    axiosInstance.get(`/papers/recommended`)
    .then((res) => setRecommendedPapers(res.data))
    .catch((err) => console.error('Failed to fetch recommended papers:', err));
  }, []);
  
const renderPaperCard = (paper, index) => (
  <div key={index} className="paper-card" onClick={() => setSelectedPaper(paper)}>
    <h3 className="paper-title">{paper.title}</h3>
    <p className="paper-abstract">
      {paper.abstract.length > 250 ? paper.abstract.slice(0, 250) + "..." : paper.abstract}
    </p>
    <div className="paper-meta">
      <span><strong>Authors:</strong> {paper.authors}</span><br />
      <span><strong>Published in:</strong> {paper.journal} ({paper.year})</span><br />
      {paper.tags && (
        <span className="paper-badge">{paper.tags}</span>
      )}
    </div>
  </div>
);

  return (
    <>
    <div className="papers-display-container">
      <h1 className="Main-title">📚Papers</h1>

      <h2 className="section-title">📚 Latest Arxiv Papers</h2>
      <div className="papers-row-scroll">
          {arxivpapers.map((paper, index) => renderPaperCard(paper,index))}
      </div>
      <h1 className="section-title">📚 Latest Pubmed Papers</h1>
      <div className="papers-row-scroll">
          {pubmedPapers.map((paper, index) => renderPaperCard(paper,index))}
      </div>
      <h1 className="section-title">📚 Recommended Papers</h1>
      <div className="papers-row-scroll">
          {recommendedPapers.map((paper, index) => renderPaperCard(paper,index))}
      </div>
    </div>
    {selectedPaper && (
      <PaperPreviewModal paper={selectedPaper} onClose={() => setSelectedPaper(null)} />
    )}
    </>
  );
};
export default PapersDisplay;
