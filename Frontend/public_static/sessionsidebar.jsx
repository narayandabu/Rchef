import React, { useEffect, useState } from 'react';
import axiosInstance from './utils/axiosInstance';
import './styles/sectionsidebar.css';

export default function SectionSidebar({setMessages, currentSectionId, onSelectSection, onCreateNewSection }) {
  const [sections, setSections] = useState([]);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');

  useEffect(() => {
    fetchSections();
    // fetchSessions();
  }, []);

  const fetchSections = async () => {
    console.log('Fetching sections...');
    try {
      const res = await axiosInstance.get('/analyze/sections', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSections(res.data.sections || []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };
  const handleSelect = async(sectionId) => {
    if (onSelectSection) {
      await onSelectSection(sectionId);
    }
  };
  const handleCreate = async () => {
    if (onCreateNewSection) {
      await onCreateNewSection(); 
      await fetchSections(); // after creation, reload
    }
  };
  const startEditing = (sectionId, currentName) => {
    setEditingSectionId(sectionId);
    setNewSectionName(currentName || '');
  };
  const handleRename = async (sectionId) => {
    try {
      await axiosInstance.post('/analyze/section/rename', {
        sectionId,
        newName: newSectionName,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      await fetchSections();
      setEditingSectionId(null);
    } catch (error) {
      console.error('Failed to rename section:', error);
    }
  };
  const handleDelete = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await axiosInstance.post('/analyze/section/delete', {
        sectionId,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if(sectionId === currentSectionId) {
        await fetchSections();
        setMessages([]); // Clear messages after deletion
      }
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  return (
    <div className="section-sidebar">
      <div className="section-header">
        <h3>Your Sessions</h3>
        <button onClick={handleCreate} className="new-section-btn">
          ➕ New
        </button>
      </div>
      <div className="section-list">
        {sections.map((section) => (
          <div
            key={section.session_id}
            className={`section-item ${section.session_id === currentSectionId ? 'active' : ''}`}
          >
            {editingSectionId === section.session_id ? (
              <div className="edit-mode">
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="edit-input"
                />
                <button
                  onClick={() => handleRename(section.session_id)}
                  className="save-btn"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="view-mode" onClick={() => handleSelect(section.session_id)}>
                <span>{section.session_name}</span>
                <div className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(section.session_id, section.session_name);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(section.session_id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
