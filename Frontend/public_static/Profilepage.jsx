import React, { useEffect, useState } from 'react';
import axiosInstance from './utils/axiosInstance';
import './styles/Profilepage.css';
import LikeButton from './like_button.jsx';
import { MdOutlineEdit } from "react-icons/md";
import { IoSave } from "react-icons/io5";

// Import icons for social/research links
import { FaGithub, FaLinkedin, FaKaggle } from 'react-icons/fa';
import { GiArchiveResearch } from "react-icons/gi"; // A generic research icon

const ProfilePage = () => {
  const [likedPapers, setLikedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [friends, setFriends] = useState([]);

  // New state variables for contact links
  const [githubLink, setGithubLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [kaggleLink, setKaggleLink] = useState('');
  const [researchGateLink, setResearchGateLink] = useState(''); // Example for another research link

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/user/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setName(res.data.name);
        setEmail(res.data.email);
        setFriends(res.data.friends || []);
        setGithubLink(res.data.githubLink || 'github.com');
        setLinkedinLink(res.data.linkedinLink || 'linkedin.com');
        setKaggleLink(res.data.kaggleLink || '');
        setResearchGateLink(res.data.researchGateLink || '');
        console.log(res.data.name);
      } catch (err) {
        console.error("Failed to fetch profile info:", err);
      }
    };

    const fetchLikedPapers = async () => {
      try {
        const res = await axiosInstance.get('/papers/liked', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLikedPapers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch liked papers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchLikedPapers();
  }, []);

  const handleSave = async () => {
    try {
      await axiosInstance.put('/user/profile', {
        name,
        password,
        githubLink, // Include new fields in the update
        linkedinLink,
        kaggleLink,
        researchGateLink
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEditMode(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const renderPaperCard = (paper, index) => (
    <div key={index} className="paper-card">
      <h3 className="paper-title">{paper.title}</h3>
      <p className="paper-abstract">
        {paper.abstract.length > 200 ? paper.abstract.slice(0, 200) + "..." : paper.abstract}
      </p>
      <div className="paper-meta">
        <span><strong>Authors:</strong> {paper.authors.length > 150 ? paper.authors.slice(0, 150) + "..." : paper.authors}</span><br />
        <span><strong>Published in:</strong> {paper.journal} ({paper.year})</span><br />
      </div>
      {paper.tags && <span className="paper-badge">{paper.tags}</span>}
      <LikeButton paper={paper} paperId={paper.id} className='card'/>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-container">
        <section className="profile-image">
          <img className='prf-img' alt='profile-pic' src="https://avatar.iran.liara.run/public/36"></img>
        </section>
        <section className="profile-info">
          <div className="profile-info-box">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" disabled={!editMode} />
            <input className="profile-info-email" value={email} placeholder="Email" disabled /> {/* Email often not editable */}
            {editMode && ( // Only show password input in edit mode
              <input className="profile-info-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" />
            )}

            {/* Contact Links */}
            {!editMode ? (
              <div className="contact-links-display">
                {githubLink && <a href={githubLink} target="_blank" rel="noopener noreferrer" title="GitHub"><FaGithub size={24} /></a>}
                {linkedinLink && <a href={linkedinLink} target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin size={24} /></a>}
                {kaggleLink && <a href={kaggleLink} target="_blank" rel="noopener noreferrer" title="Kaggle"><FaKaggle size={24} /></a>}
                {researchGateLink && <a href={researchGateLink} target="_blank" rel="noopener noreferrer" title="ResearchGate/Other Research"><GiArchiveResearch size={24} /></a>}
              </div>
            ) : (
              <div className="contact-links-edit">
                <input value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="GitHub Profile URL" />
                <input value={linkedinLink} onChange={(e) => setLinkedinLink(e.target.value)} placeholder="LinkedIn Profile URL" />
                <input value={kaggleLink} onChange={(e) => setKaggleLink(e.target.value)} placeholder="Kaggle Profile URL" />
                <input value={researchGateLink} onChange={(e) => setResearchGateLink(e.target.value)} placeholder="ResearchGate/Other Profile URL" />
              </div>
            )}

            <div className="profile-actions"> {/* Wrapper for buttons */}
              {!editMode ? (
                <button className='edit-btn' onClick={() => setEditMode(true)}>
                  <MdOutlineEdit color='white' size={24}/> Edit Profile
                </button>
              ) : (
                <>
                  <button className='save-btn' onClick={handleSave}><IoSave size={24}/> Save</button>
                  <button className='cancel-btn' onClick={() => { setEditMode(false); /* Optionally reset form fields */ }}>Cancel</button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="friends-section">
          <h3>Friends</h3>
          {friends.length === 0 ? <p>No friends yet.</p> : (
            <ul>
              {friends.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}
        </section>

      </div>
      <section className="liked-papers-section">
        <h3 className='liked-papers-title'>💗 Liked Papers</h3>
        {loading ? (
          <p>Loading...</p>
        ) : likedPapers.length === 0 ? (
          <p>No liked papers yet.</p>
        ) : (
          <div className="paper-grid">
            {likedPapers.map(paper => renderPaperCard(paper, paper.id))}
          </div>
        )}
      </section>
      <section className="bookmarked-papers-section">
        <h3 className='bookmarked-papers-title'>📑 Bookmarked Papers</h3> 
        {loading ? (
          <p>Loading...</p>
        ) : likedPapers.length === 0 ?(
          <p>No bookmarked papers yet.</p>
        ) : (
          <div className="paper-grid">
            {likedPapers.map(paper => renderPaperCard(paper, paper.id))}
          </div>
        )}
      </section> 
      

    </div>
  );
};

export default ProfilePage;