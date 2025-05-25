import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { use } from 'react';

const useUserSearch = (loggedInUserId) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const handleSearch = useCallback(async () => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        setSearchLoading(true);
        setSearchError(null);
        try {
            const res = await axiosInstance.get(`/profile/search-users?query=${searchTerm}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            const filteredResults = res.data.filter(user => String(user.id) !== String(loggedInUserId));
            
            setSearchResults(filteredResults);
        } catch (err) {
            console.error('Failed to search users:', err);
            setSearchError('Failed to search users. Please try again.');
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, [searchTerm, loggedInUserId]);

    useEffect(() => {
        const handler = setTimeout(() => {
            handleSearch();
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, handleSearch]);

    return {
        searchTerm,
        setSearchTerm,
        searchResults,
        setSearchResults, 
        searchLoading,
        searchError,
        setSearchError
    };
};

export default useUserSearch;