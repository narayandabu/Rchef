import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

import './styles/Profilepage.css';
import LikeButton from '../like_button'; // Assuming you have this component
import FriendsSection from './Friends';

import { MdOutlineEdit } from 'react-icons/md';
import { IoSave } from 'react-icons/io5';
import { FaGithub, FaLinkedin, FaKaggle, FaPlus } from 'react-icons/fa';
import { GiArchiveResearch } from 'react-icons/gi';
import { MdPersonAddDisabled } from 'react-icons/md';
import { FiUserCheck } from 'react-icons/fi';

// function to ensure URL has a protocol
const ensureHttps = (url) => {
    if (!url) return '';
    // Check if it already starts with http:// or https://
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    // Prepend https:// by default
    return `https://${url}`;
};

const getLoggedInUserId = () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            return String(decodedToken.id);
        } catch (error) {
            console.error('Error decoding token:', error);
            localStorage.removeItem('token'); // Clear invalid token
            return null;
        }
    }
    return null;
};

const ProfilePage = () => {
    const { userId: paramUserId } = useParams();
    const location = useLocation();
    const navigate = useNavigate(); // For redirection if not logged in

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [username, setUsername] = useState(''); // Changed from name to username
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // For new password input
    const [githubLink, setGithubLink] = useState('');
    const [linkedinLink, setLinkedinLink] = useState('');
    const [kaggleLink, setKaggleLink] = useState('');
    const [researchGateLink, setResearchGateLink] = useState('');

    const [editMode, setEditMode] = useState(false);
    const [isOwner, setIsOwner] = useState(false); // Is the logged-in user viewing their own profile?
    const [isFriend, setIsFriend] = useState(false); // Is the viewed profile a friend of the logged-in user?
    const [hasSentRequest, setHasSentRequest] = useState(false); // Has logged-in user sent request to viewed profile?
    const [hasReceivedRequest, setHasReceivedRequest] = useState(false); // Has viewed profile sent request to logged-in user?

    const [likedPapers, setLikedPapers] = useState([]); // Placeholder
    const [bookmarkedPapers, setBookmarkedPapers] = useState([]); // Placeholder
    const [friends, setFriends] = useState([]); // Friends list for the profile being viewed

    // NEW STATE: To store incoming friend requests
    const [pendingIncomingRequests, setPendingIncomingRequests] = useState([]);

    const loggedInUserId = getLoggedInUserId();

    // --- Data Fetching Logic ---
    const fetchProfileData = useCallback(async (targetProfileId) => {
        setLoading(true);
        setError(null);

        if (!targetProfileId) {
            setError('Invalid profile ID.');
            setLoading(false);
            return;
        }

        try {
            const url = isOwner ? '/profile' : `/profile/${targetProfileId}`; // Use /profile for own, /profile/:id for others
            const res = await axiosInstance.get(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            const data = res.data;
            setProfileData(data);
            setUsername(data.username || ''); // Set username
            setEmail(data.email || '');
            setGithubLink(ensureHttps(data.githubLink || ''));
            setLinkedinLink(ensureHttps(data.linkedinLink || ''));
            setKaggleLink(ensureHttps(data.kaggleLink || ''));
            setResearchGateLink(ensureHttps(data.researchGateLink || ''));
            setFriends(data.friends || []); // Set friends list from response

            if (!isOwner) { // Only set these for other users' profiles
                setIsFriend(data.isFriend || false);
                setHasSentRequest(data.hasSentRequest || false);
                setHasReceivedRequest(data.hasReceivedRequest || false);
            } else { // Reset for own profile
                setIsFriend(false);
                setHasSentRequest(false);
                setHasReceivedRequest(false);
            }
        } catch (err) {
            console.error('Failed to fetch profile info:', err);
            setProfileData(null);
            setError('Failed to load profile. It might not exist or you lack permission.');
            if (err.response && err.response.status === 401) {
                navigate('/login'); // Redirect to login if token is invalid/expired
            }
        } finally {
            setLoading(false);
        }
    }, [isOwner, navigate]); // isOwner and navigate are dependencies

    // Function for fetching liked/bookmarked papers
    const fetchPapers = useCallback(async (paperType, setStateFunc, targetProfileId) => {
        if (!targetProfileId) {
            console.warn(`Cannot fetch ${paperType} papers: targetProfileId is missing.`);
            setStateFunc([]);
            return;
        }

        // Only fetch papers for the owner's profile
        if (String(targetProfileId) !== String(loggedInUserId)) {
            setStateFunc([]); // Clear papers if viewing someone else's profile
            return;
        }

        try {
            let endpoint = '';
            if (paperType === 'liked') {
                endpoint = '/papers/liked';
            } else if (paperType === 'bookmarked') {
                // endpoint = '/papers/bookmarked';
                //TODO:Change after implementing bookmarks in backend
                endpoint = '/papers/liked';

            } else {
                console.error('Unknown paper type:', paperType);
                setStateFunc([]);
                return;
            }

            const res = await axiosInstance.get(endpoint, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setStateFunc(res.data);
        } catch (err) {
            console.error(`Failed to fetch ${paperType} papers:`, err);
            setStateFunc([]);
        } finally {
            // Loading state managed by fetchProfileData
        }
    }, [loggedInUserId]); // Dependency on loggedInUserId

    // NEW: Function to fetch incoming friend requests
    const fetchIncomingFriendRequests = useCallback(async (userId) => {
        if (!userId) return; // Only fetch if userId is valid
        try {
            const res = await axiosInstance.get('/profile/friend-requests/incoming', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setPendingIncomingRequests(res.data);
        } catch (err) {
            console.error('Error fetching incoming friend requests:', err);
            setPendingIncomingRequests([]);
        }
    }, []); // No dependencies that would cause re-creation issues for now

    // Effect to determine current profile ID and fetch data
    useEffect(() => {
        const currentProfileId =
            location.pathname === '/main/my-profile' ? loggedInUserId : paramUserId;

        const ownerCheck = String(currentProfileId) === String(loggedInUserId);
        setIsOwner(ownerCheck);

        if (!loggedInUserId) {
            setError('You must be logged in to view profiles.');
            setLoading(false);
            navigate('/login'); // Redirect if not logged in
            return;
        }

        if (!currentProfileId) {
            setError('No profile ID provided.');
            setLoading(false);
            return;
        }

        // Fetch main profile data
        fetchProfileData(currentProfileId);

        // Fetch papers and incoming requests only if viewing own profile
        if (ownerCheck) {
            fetchPapers('liked', setLikedPapers, currentProfileId);
            fetchPapers('bookmarked', setBookmarkedPapers, currentProfileId);
            fetchIncomingFriendRequests(currentProfileId); // CALL THE NEW FUNCTION HERE
        } else {
            // Clear papers and incoming requests if not viewing own profile
            setLikedPapers([]);
            setBookmarkedPapers([]);
            setPendingIncomingRequests([]);
        }
    }, [paramUserId, loggedInUserId, location.pathname, fetchProfileData, fetchPapers, fetchIncomingFriendRequests, navigate]);

    // Callback for when a friend action (like accept/unfriend) happens in FriendsSection
    // This ensures the main ProfilePage's friend status (isFriend, etc.) and
    // the 'friends' list passed to FriendsSection is refreshed.
    const handleFriendActionSuccess = useCallback(() => {
        const currentProfileId = location.pathname === '/main/my-profile' ? loggedInUserId : paramUserId;
        if (currentProfileId) {
            fetchProfileData(currentProfileId); // Re-fetch all profile data including updated friends list
            // If it's the owner's profile, also re-fetch incoming requests
            if (String(currentProfileId) === String(loggedInUserId)) {
                fetchIncomingFriendRequests(currentProfileId);
            }
        }
    }, [loggedInUserId, paramUserId, location.pathname, fetchProfileData, fetchIncomingFriendRequests]);


    // --- Handlers for User Actions ---
    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const updatePayload = {
                username, // Changed from name to username
                githubLink,
                linkedinLink,
                kaggleLink,
                researchGateLink,
            };
            if (password) { // Only include password if it was entered
                updatePayload.password = password;
            }

            await axiosInstance.put('/profile', updatePayload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setEditMode(false);
            setPassword(''); // Clear password field after save
            await fetchProfileData(loggedInUserId); // Re-fetch to update UI
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        if (profileData) {
            setUsername(profileData.username || ''); // Reset username
            setEmail(profileData.email || '');
            setGithubLink(profileData.githubLink || '');
            setLinkedinLink(profileData.linkedinLink || '');
            setKaggleLink(profileData.kaggleLink || '');
            setResearchGateLink(profileData.researchGateLink || '');
            setPassword('');
        }
    };

    // Friend action logic for the main profile page (Add/Pending/Accept/Unfriend buttons)
    // This handler will also be passed to FriendsSection for Accept/Decline actions on incoming requests.
    const handleProfileFriendAction = async (actionType, targetUserId) => { // Added targetUserId parameter
        setError(null);

        // Use paramUserId if targetUserId is not explicitly provided (for buttons on the main profile view)
        const actualTargetUserId = targetUserId || paramUserId;

        if (!actualTargetUserId || !loggedInUserId) {
            setError('Could not perform friend action: target user or logged-in user is unknown.');
            return;
        }

        let endpoint = '';
        let method = '';

        switch (actionType) {
            case 'add':
                endpoint = `/profile/friend-request/${actualTargetUserId}`;
                method = 'post';
                break;
            case 'cancelRequest': // Used for both cancelling outgoing and declining incoming
                endpoint = `/profile/friend-request/${actualTargetUserId}`;
                method = 'delete';
                break;
            case 'accept':
                endpoint = `/profile/friend-request/${actualTargetUserId}/accept`;
                method = 'put';
                break;
            case 'unfriend':
                endpoint = `/profile/friend/${actualTargetUserId}`;
                method = 'delete';
                break;
            default:
                setError('An unknown friend action was attempted.');
                return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            if (method === 'post') {
                await axiosInstance.post(endpoint, {}, config);
            } else if (method === 'put') {
                await axiosInstance.put(endpoint, {}, config);
            } else if (method === 'delete') {
                await axiosInstance.delete(endpoint, config);
            }
            // After any friend action, re-fetch all relevant data
            handleFriendActionSuccess();
        } catch (err) {
            console.error(`Failed to perform friend action ${actionType}:`, err);
            setError(`Failed to perform action: ${err.response?.data?.message || err.message}`);
        }
    };

    // --- Render Helpers (Placeholder for papers) ---
    const renderPaperCard = (paper) => (
        <div key={paper.id} className="paper-card">
            <h3 className="paper-title">{paper.title || 'Paper Title'}</h3>
            <p className="paper-abstract">
                {paper.abstract ? (paper.abstract.length > 200 ? paper.abstract.slice(0, 200) + '...' : paper.abstract) : 'No abstract available.'}
            </p>
            <div className="paper-meta">
                <span>
                    <strong>Authors:</strong> {paper.authors || 'N/A'}
                </span>
                <br />
                <span>
                    <strong>Published in:</strong> {paper.journal || 'N/A'} ({paper.year || 'N/A'})
                </span>
                <br />
            </div>
            {paper.tags && <span className="paper-badge">{paper.tags}</span>}
            <LikeButton paper={paper} paperId={paper.id} className="card" />
        </div>
    );

    // --- Conditional Rendering for Loading/Error States ---
    if (loading) {
        return (
            <div className="profile-page loading">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page error">
                <p>{error}</p>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="profile-page error">
                <p>Profile not found or access denied.</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-image-container">
                <section className="profile-image">
                    <img className="prf-img" alt="profile-pic" src="https://avatar.iran.liara.run/public/36" />
                </section>
                    {!isOwner && (
                        <div className="friend-action-container">
                            {isFriend ? (
                                <button
                                    className="friend-action-btn friend-connected"
                                    onClick={() => handleProfileFriendAction('unfriend', paramUserId)} // Pass paramUserId
                                    title="Friends"
                                >
                                    <FiUserCheck size={20} /> Friends
                                </button>
                            ) : hasSentRequest ? (
                                <button
                                    className="friend-action-btn friend-pending"
                                    onClick={() => handleProfileFriendAction('cancelRequest', paramUserId)} // Pass paramUserId
                                    title="Request Sent"
                                >
                                    <MdPersonAddDisabled size={20} /> Pending
                                </button>
                            ) : hasReceivedRequest ? (
                                <button
                                    className="friend-action-btn friend-accept"
                                    onClick={() => handleProfileFriendAction('accept', paramUserId)} // Pass paramUserId
                                    title="Accept Request"
                                >
                                    <FaPlus size={20} /> Accept
                                </button>
                            ) : (
                                <button
                                    className="friend-action-btn friend-add"
                                    onClick={() => handleProfileFriendAction('add', paramUserId)} // Pass paramUserId
                                    title="Add Friend"
                                >
                                    <FaPlus size={20} /> Add Friend
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <section className="profile-info">
                    <div className="profile-info-box">
                        <label>Username:</label>
                        <input value={username} onChange={(e) => setUsername(e.target.value)} disabled={!isOwner || !editMode} />
                        <label>Email:</label>
                        <input className="profile-info-email" value={email} disabled />

                        {isOwner && editMode && (
                            <>
                                <label>New Password:</label>
                                <input
                                    className="profile-info-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </>
                        )}

                        {!isOwner || !editMode ? (
                            <div className="contact-links-display">
                                {githubLink && (
                                    <a href={githubLink} target="_blank" rel="noopener noreferrer" title="GitHub Profile">
                                        <FaGithub size={28} />
                                    </a>
                                )}
                                {linkedinLink && (
                                    <a href={linkedinLink} target="_blank" rel="noopener noreferrer" title="LinkedIn Profile">
                                        <FaLinkedin size={28} />
                                    </a>
                                )}
                                {kaggleLink && (
                                    <a href={kaggleLink} target="_blank" rel="noopener noreferrer" title="Kaggle Profile">
                                        <FaKaggle size={28} />
                                    </a>
                                )}
                                {researchGateLink && (
                                    <a href={researchGateLink} target="_blank" rel="noopener noreferrer" title="ResearchGate/Other Research Profile">
                                        <GiArchiveResearch size={28} />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="contact-links-edit">
                                <label>GitHub URL:</label>
                                <input value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="GitHub Profile URL" />
                                <label>LinkedIn URL:</label>
                                <input value={linkedinLink} onChange={(e) => setLinkedinLink(e.target.value)} placeholder="LinkedIn Profile URL" />
                                <label>Kaggle URL:</label>
                                <input value={kaggleLink} onChange={(e) => setKaggleLink(e.target.value)} placeholder="Kaggle Profile URL" />
                                <label>ResearchGate URL:</label>
                                <input value={researchGateLink} onChange={(e) => setResearchGateLink(e.target.value)} placeholder="ResearchGate/Other Profile URL" />
                            </div>
                        )}

                        {isOwner && (
                            <div className="profile-actions">
                                {!editMode ? (
                                    <button className="edit-btn" onClick={() => setEditMode(true)}>
                                        <MdOutlineEdit color="white" size={24} /> Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button className="save-btn" onClick={handleSave}>
                                            <IoSave size={24} /> Save
                                        </button>
                                        <button className="cancel-btn" onClick={handleCancelEdit}>
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Pass the new prop `pendingIncomingRequests` to FriendsSection */}
                {/* Also pass `handleProfileFriendAction` for accept/decline actions */}
                {/* NEW: Pass isOwner and username of the profile being viewed */}
                <FriendsSection
                    friends={friends}
                    loggedInUserId={loggedInUserId}
                    onFriendActionSuccess={handleFriendActionSuccess}
                    pendingIncomingRequests={pendingIncomingRequests}
                    onAcceptDeclineRequest={handleProfileFriendAction}
                    isOwner={isOwner} // Pass isOwner
                    profileUsername={username} // Pass the username of the profile being viewed
                />

            </div>

            {isOwner && (
                <>
                    <section className="liked-papers-section">
                        <h3 className="liked-papers-title">💗 Liked Papers</h3>
                        {likedPapers.length === 0 ? (
                            <p>No liked papers yet.</p>
                        ) : (
                            <div className="paper-grid">{likedPapers.map((paper) => renderPaperCard(paper))}</div>
                        )}
                    </section>

                    <section className="bookmarked-papers-section">
                        <h3 className="bookmarked-papers-title">📑 Bookmarked Papers</h3>
                        {bookmarkedPapers.length === 0 ? (
                            <p>No bookmarked papers yet.</p>
                        ) : (
                            <div className="paper-grid">{bookmarkedPapers.map((paper) => renderPaperCard(paper))}</div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default ProfilePage;
