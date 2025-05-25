import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './styles/FriendsSection.css';

import useUserSearch from './Friends_components/useUserSearch';
import useFriendActions from './Friends_components/useFriendActions';

import { FaPlus } from 'react-icons/fa';
import { MdPersonAddDisabled } from 'react-icons/md';
import { FiUserCheck } from 'react-icons/fi';
import { GoSearch } from "react-icons/go";
import { IoIosCloseCircle } from 'react-icons/io'; // Import for Decline button

const FriendsSection = ({
    friends: initialFriends,
    loggedInUserId,
    onFriendActionSuccess,
    pendingIncomingRequests, // NEW PROP: Array of {id, username}
    onAcceptDeclineRequest, // NEW PROP: Function to handle accept/decline actions
    isOwner, // NEW PROP
    profileUsername
}) => {
    const navigate = useNavigate(); // Initialize useNavigate hook

    const {
        searchTerm,
        setSearchTerm,
        searchResults,
        searchLoading,
        searchError,
        setSearchError,
        setSearchResults // IMPORTANT: Destructure setSearchResults from useUserSearch
    } = useUserSearch(loggedInUserId);

    const { performFriendAction, friendActionError } = useFriendActions(
        loggedInUserId,
        setSearchResults, // Pass setSearchResults directly to the hook
        onFriendActionSuccess
    );

    const displayError = searchError || friendActionError;

    // This handler is for the search results, not the incoming requests
    const handleFriendActionOnSearchResult = async (targetUserId, actionType) => {
        await performFriendAction(targetUserId, actionType);
    };

    // Handler for accepting or declining friend requests from the incoming requests section
    const handleRequestAction = async (actionType, requesterId) => {
        // actionType can be 'accept' or 'cancelRequest' (for declining)
        await onAcceptDeclineRequest(actionType, requesterId);
        // onFriendActionSuccess will be called by onAcceptDeclineRequest in ProfilePage.jsx
        // which will re-fetch incoming requests and update the UI.
    };

    const renderFriendActionButton = (user) => {
        if (String(user.id) === String(loggedInUserId)) {
            return null;
        } else if (user.isFriend) {
            return (
                <button
                    className="friend-action-btn friend-connected"
                    onClick={() => handleFriendActionOnSearchResult(user.id, 'unfriend')}
                    title="Friends (Click to Unfriend)"
                >
                    <FiUserCheck size={18} /> Friends
                </button>
            );
        } else if (user.hasSentRequest) {
            return (
                <button
                    className="friend-action-btn friend-pending"
                    onClick={() => handleFriendActionOnSearchResult(user.id, 'cancelRequest')}
                    title="Request Sent"
                >
                    <MdPersonAddDisabled size={18} /> Pending
                </button>
            );
        } else if (user.hasReceivedRequest) {
            return (
                <button
                    className="friend-action-btn friend-accept"
                    onClick={() => handleFriendActionOnSearchResult(user.id, 'accept')}
                    title="Accept Request"
                >
                    <FaPlus size={18} /> Accept
                </button>
            );
        } else {
            return (
                <button
                    className="friend-action-btn friend-add"
                    onClick={() => handleFriendActionOnSearchResult(user.id, 'add')}
                    title="Add Friend"
                >
                    <FaPlus size={18} /> Add Friend
                </button>
            );
        }
    };

    const displayList = searchTerm.trim() !== '' ? searchResults : initialFriends;
    const listTitle = searchTerm.trim() !== ''
        ? 'Search Results'
        : isOwner
            ? 'Your Friends'
            : `Friends of ${profileUsername}`; 
    const noContentMessage = searchTerm.trim() !== '' ? 'No users found.' : 'No friends yet.';

    return (
        <section className="friends-section-container">
            {/* NEW: Incoming Friend Requests Section */}
            {pendingIncomingRequests && pendingIncomingRequests.length > 0 && (
                <div className="incoming-requests-container">
                    <h4>Friend Requests <span className="request-count">({pendingIncomingRequests.length})</span></h4>
                    <ul className="incoming-requests-list">
                        {pendingIncomingRequests.map(request => (
                            <li key={request.id} className="request-card">
                                {/* Clicking username navigates to their profile */}
                                <Link to={`/main/profile/${request.id}`} className="request-username-link">
                                    <img
                                        src={`https://avatar.iran.liara.run/public/${request.id}`} // Placeholder for profile picture
                                        alt={request.username}
                                        className="friend-avatar" // Reusing friend-avatar style
                                    />
                                    <span className="request-username">{request.username}</span>
                                </Link>
                                <div className="request-actions">
                                    <button
                                        className="accept-btn"
                                        title="Accept Request"
                                        onClick={() => handleRequestAction('accept', request.id)}
                                    >
                                        <FaPlus size={16} /> Accept
                                    </button>
                                    <button
                                        className="decline-btn"
                                        title="Decline Request"
                                        onClick={() => handleRequestAction('cancelRequest', request.id)}
                                    >
                                        <IoIosCloseCircle size={20} /> Decline
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Search Bar */}
            <h3>{listTitle}</h3>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by username or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <GoSearch size={22} className="search-icon" />
            </div>

            {searchLoading && <p className="friends-loading-error">Searching...</p>}
            {displayError && <p className="friends-loading-error">{displayError}</p>}

            {/* Display Friends or Search Results */}
            {!searchLoading && !displayError && displayList.length === 0 ? (
                <p className="no-friends-message">{noContentMessage}</p>
            ) : (
                <ul className="friends-list-ul">
                    {displayList.map((user) => (
                        <li key={user.id} className="friend-item">
                            <Link to={`/main/profile/${user.id}`} className="friend-link">
                                <img
                                    src={user.profilePictureUrl || `https://avatar.iran.liara.run/public/${user.id}`} // Use user.id for unique avatar
                                    alt={user.username}
                                    className="friend-avatar"
                                />
                                <span className="friend-name">{user.username}</span>
                            </Link>
                            {loggedInUserId && String(user.id) !== String(loggedInUserId) && (
                                <div className="friend-action-buttons">
                                    {renderFriendActionButton(user)}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default FriendsSection;
