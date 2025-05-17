import React, { useState } from 'react';
import './styles/notes.css';

const Notebook = ({ isOpen, onClose,externalNote,setExternalNote}) => {
  // const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState('write');
  const handleNoteChange = (e) => {
    setExternalNote(e.target.value);
  };
  const handleSave = () => {
    localStorage.setItem('research_note', externalNote);
    alert('Note saved locally!');
  };
  const parseMarkdown = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h3 key={idx}>{line.slice(3)}</h3>;
      } else if (line.startsWith('# ')) {
        return <h2 key={idx}>{line.slice(2)}</h2>;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx}>{line.slice(2)}</li>;
      } else {
        return <p key={idx}>{line}</p>;
      }
    });
  };

  const handleClear = () => {
    setExternalNote('');
  };

  const handleExport = () => {
    const blob = new Blob([externalNote], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`notebook-panel ${isOpen ? 'open' : ''}`}>
      <div className="notebook-header">
        <h2>Notebook</h2>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
      {/* Tabs */}
      <div className="notebook-tabs">
        <button
          className={activeTab === 'write' ? 'active' : ''}
          onClick={() => setActiveTab('write')}
        >
          📝 Write
        </button>
        <button
          className={activeTab === 'preview' ? 'active' : ''}
          onClick={() => setActiveTab('preview')}
        >
          👁️ Preview
        </button>
      </div>

      {/* Content */}
      {activeTab === 'write' ? (
        <textarea
          className="notebook-textarea"
          value={externalNote}
          onChange={handleNoteChange}

          placeholder="Write your research notes here..."
        />
      ) : (
        <div className="notebook-preview">
          <div className="preview-content scrollable">
            {parseMarkdown(externalNote)}
          </div>
        </div>
      )}

      <div className="notebook-buttons">
        <button onClick={handleSave}>💾 Save</button>
        <button onClick={handleExport}>⬇️ Export</button>
        <button onClick={handleClear}>🧹 Clear</button>
      </div>
    </div>
  );
};

export default Notebook;
