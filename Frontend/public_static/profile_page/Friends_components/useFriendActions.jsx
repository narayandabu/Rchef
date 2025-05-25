import { useState, useCallback } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const useFriendActions = (loggedInUserId, setSearchResults, onFriendActionSuccess) => {
    const [friendActionError, setFriendActionError] = useState(null);
    
    const performFriendAction = useCallback(async (targetUserId, actionType) => {
        setFriendActionError(null);
        const notifyuser = async(targetUserId)=> {
        try {
                const push = await axiosInstance.post('/notifications/push', {
                content: "🟩You have a new friend request from ",
                type: "info",
                tool: "test",
                route: "/my-profile",
                reciever_id: targetUserId,
                });
            console.log('successfully sent notification', push);
        } 
        catch (err) {
            console.log(err);
        }
        }
        if (!targetUserId || !loggedInUserId) {
            console.error('Missing IDs for friend action.');
            setFriendActionError('Error performing friend action: Missing user IDs.');
            return;
        }

        let endpoint = '';
        let method = '';

        switch (actionType) {
            case 'add':
                endpoint = `profile/friend-request/${targetUserId}`;
                method = 'post';
                break;
            case 'cancelRequest':
                endpoint = `profile/friend-request/${targetUserId}`;
                method = 'delete';
                break;
            case 'accept':
                endpoint = `profile/friend-request/${targetUserId}/accept`;
                method = 'put';
                break;
            case 'unfriend':
                endpoint = `profile/friend/${targetUserId}`;
                method = 'delete';
                break;
            default:
                console.error('Unknown friend action type:', actionType);
                setFriendActionError('An unknown friend action was attempted.');
                return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
            if (method === 'post') {
                await axiosInstance.post(endpoint, {}, config);
                await notifyuser(targetUserId);
            } else if (method === 'put') {
                await axiosInstance.put(endpoint, {}, config);
            } else if (method === 'delete') {
                await axiosInstance.delete(endpoint, config);
            }

            setSearchResults(prevResults =>
                prevResults.map(user => {
                    if (String(user.id) === String(targetUserId)) {
                        if (actionType === 'add') {
                            return { ...user, hasSentRequest: true, isFriend: false, hasReceivedRequest: false };
                        } else if (actionType === 'cancelRequest') {
                            return { ...user, hasSentRequest: false, isFriend: false, hasReceivedRequest: false };
                        } else if (actionType === 'accept') {
                            return { ...user, isFriend: true, hasReceivedRequest: false, hasSentRequest: false };
                        } else if (actionType === 'unfriend') {
                            return { ...user, isFriend: false, hasSentRequest: false, hasReceivedRequest: false };
                        }
                    }
                    return user;
                })
            );

            if (actionType === 'accept' || actionType === 'unfriend') {
                onFriendActionSuccess();
            }

        } catch (err) {
            console.error(`Failed to perform friend action ${actionType}:`, err);
            setFriendActionError(`Failed to perform action: ${err.response?.data?.message || err.message}`);
        }
    }, [loggedInUserId, setSearchResults, onFriendActionSuccess]);

    return { performFriendAction, friendActionError, setFriendActionError };
};

export default useFriendActions;