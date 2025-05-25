// routes/userprofile.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const verifyToken = require('../middleware/verifyToken'); // Assuming this middleware correctly sets req.user.id and req.user.email
const fs = require('fs');

const { promisify } = require('util');

// Path to the main users database
const dbPath = path.join(__dirname, '../database/users.db');
const db = new sqlite3.Database(dbPath);

// Promisify common sqlite3 methods for the main database
const dbAll = promisify(db.all).bind(db);
const dbGet = promisify(db.get).bind(db);
const dbRun = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) { // IMPORTANT: Use a regular function to access 'this'
            if (err) {
                return reject(err);
            }
            resolve(this); // Resolve with 'this' context, which contains .changes and .lastID
        });
    });
};

// Helper function to get the path for a user's individual friends database
const getUserFriendDbPath = (userEmail) => {
    const userFolder = path.join(__dirname, '../database', userEmail);
    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
    }
    return path.join(userFolder, 'friends.db');
};

// Helper function to open and initialize a user's friends database
// This function ensures the database is fully open and the 'my_friends' table exists.
const getFriendDb = (userEmail) => {
    return new Promise((resolve, reject) => {
        const friendDbPath = getUserFriendDbPath(userEmail);

        // Use the callback function to ensure the database is open
        const friendDb = new sqlite3.Database(friendDbPath, (err) => {
            if (err) {
                console.error(`Error opening friend DB for ${userEmail}:`, err);
                return reject(err); // Reject the promise if opening fails
            }

            // Database is now open. Now we can safely promisify .run for table creation
            const friendDbRun = promisify(friendDb.run).bind(friendDb);

            friendDb.serialize(() => {
                friendDbRun(`
                    CREATE TABLE IF NOT EXISTS my_friends (
                        id INTEGER PRIMARY KEY,
                        username TEXT NOT NULL
                    )
                `)
                .then(() => {
                    // Table creation is complete, now resolve with the fully initialized database instance
                    resolve(friendDb);
                })
                .catch(createErr => {
                    console.error(`Error creating table in friend DB for ${userEmail}:`, createErr);
                    friendDb.close(); // Close the DB if table creation fails
                    reject(createErr); // Reject if table creation fails
                });
            });
        });
    });
};


// --- Profile Management Routes ---

// GET logged-in user's profile
router.get('/', verifyToken, async (req, res) => {
    const { id, email } = req.user; // Get id and email from the token
    try {
        // Fetch user details from the main users.db
        const user = await dbGet(`SELECT id, email, name AS username, githubLink, linkedinLink, kaggleLink, researchGateLink FROM users WHERE id = ?`, [id]);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch friends from the user's individual friends.db
        const friendDb = await getFriendDb(email); // Await the promise to get the DB instance
        const friendDbAll = promisify(friendDb.all).bind(friendDb);
        let friends = await friendDbAll(`SELECT id, username FROM my_friends`);
        friendDb.close(); // Close the individual friendDb connection after use

        // For friends fetched from my_friends, they are inherently "isFriend"
        friends = friends.map(friend => ({
            ...friend,
            isFriend: true,
            hasSentRequest: false,
            hasReceivedRequest: false
        }));

        res.json({ ...user, friends, likedPapers: [], bookmarkedPapers: [] }); // Placeholder for papers
    } catch (err) {
        console.error('Error fetching own profile:', err);
        res.status(500).json({ error: "Error fetching profile" });
    }
});
// PUT update logged-in user's profile
router.put('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { username, password, githubLink, linkedinLink, kaggleLink, researchGateLink } = req.body;

    if (!username || username.trim() === '') {
        return res.status(400).json({ message: 'Username cannot be empty.' });
    }

    let updateFields = [];
    let updateValues = [];

    updateFields.push('name = ?'); // 'name' column in users.db corresponds to 'username'
    updateValues.push(username);

    if (password) {
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        updateFields.push('passwordhash = ?');
        updateValues.push(passwordHash);
    }

    // Add optional links if provided (or set to null if empty string)
    updateFields.push('githubLink = ?');
    updateValues.push(githubLink || null);
    updateFields.push('linkedinLink = ?');
    updateValues.push(linkedinLink || null);
    updateFields.push('kaggleLink = ?');
    updateValues.push(kaggleLink || null);
    updateFields.push('researchGateLink = ?');
    updateValues.push(researchGateLink || null);

    const query = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = ?;
    `;
    updateValues.push(userId); // Add userId for the WHERE clause

    try {
        const result = await dbRun(query, updateValues);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Profile not found or no changes made.' });
        }
        res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (err) {
        console.error('Database error updating profile:', err);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
});
// --- Friend System Routes ---

// Search users by username or ID
router.get('/search-users', verifyToken, async (req, res) => {
    const loggedInUserId = req.user.id;
    const searchTerm = req.query.query;

    console.log('searching for',searchTerm);
    if (!searchTerm || searchTerm.trim() === '') {
        return res.json([]);
    }

    const searchQuery = `%${searchTerm.toLowerCase()}%`;
    try {
        const users = await dbAll(`
            SELECT id, name, email
            FROM users
            WHERE (LOWER(name) LIKE ? OR id = ?) AND id != ?
            LIMIT 20;
        `, [searchQuery, searchTerm, loggedInUserId]);

        if (users.length === 0) {
            return res.json([]);
        }

        const usersWithStatus = await Promise.all(users.map(async (user) => {
            const targetUserId = user.id;

            // Check friendship status from the main 'friendships' table
            const isFriend = await dbGet(`
                SELECT 1 FROM friendships
                WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))
                AND status = 'accepted'
            `, [loggedInUserId, targetUserId, targetUserId, loggedInUserId]);

            const hasSentRequest = await dbGet(`
                SELECT 1 FROM friendships
                WHERE requester_id = ? AND receiver_id = ? AND status = 'pending'
            `, [loggedInUserId, targetUserId]);

            const hasReceivedRequest = await dbGet(`
                SELECT 1 FROM friendships
                WHERE requester_id = ? AND receiver_id = ? AND status = 'pending'
            `, [targetUserId, loggedInUserId]);
            console.log(user.id, user.name, isFriend, hasSentRequest, hasReceivedRequest);
            return {
                id: user.id,
                username: user.name,
                isFriend: !!isFriend,
                hasSentRequest: !!hasSentRequest,
                hasReceivedRequest: !!hasReceivedRequest
            };
        }));

        res.json(usersWithStatus);

    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).json({ error: 'Failed to search users.' });
    }
});
// GET someone else's profile by ID
router.get('/:id', verifyToken, async (req, res) => {
    const viewerId = req.user.id; // The logged-in user viewing the profile
    const profileId = parseInt(req.params.id); // The ID of the profile being viewed

    if (isNaN(profileId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        // Fetch user details from the main users.db
        const user = await dbGet(`SELECT id, email, name AS username, githubLink, linkedinLink, kaggleLink, researchGateLink FROM users WHERE id = ?`, [profileId]);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch friends from the viewed user's individual friends.db
        const friendDb = await getFriendDb(user.email); // Await the promise
        const friendDbAll = promisify(friendDb.all).bind(friendDb);
        let friends = await friendDbAll(`SELECT id, username FROM my_friends`);
        friendDb.close(); // Close the individual friendDb connection

        // For friends fetched from my_friends, they are inherently "isFriend"
        friends = friends.map(friend => ({
            ...friend,
            isFriend: true,
            hasSentRequest: false,
            hasReceivedRequest: false
        }));

        // Determine the relationship between the viewer and the profile being viewed
        const relation = await dbGet(`SELECT status FROM friendships WHERE requester_id = ? AND receiver_id = ?`, [viewerId, profileId]);
        const reverseRelation = await dbGet(`SELECT status FROM friendships WHERE requester_id = ? AND receiver_id = ?`, [profileId, viewerId]);

        const isFriend = (relation?.status === 'accepted' || reverseRelation?.status === 'accepted');
        const hasSentRequest = (relation?.status === 'pending');
        const hasReceivedRequest = (reverseRelation?.status === 'pending');

        res.json({
            ...user,
            friends,
            isFriend,
            hasSentRequest,
            hasReceivedRequest,
            likedPapers: [], // Placeholder
            bookmarkedPapers: [], // Placeholder
        });
    } catch (err) {
        console.error('Error fetching other user profile:', err);
        res.status(500).json({ error: "Error fetching profile" });
    }
});
// POST friend request
router.post('/friend-request/:id', verifyToken, async (req, res) => {
    const requesterId = req.user.id;
    const receiverId = parseInt(req.params.id);

    if (isNaN(receiverId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    if (requesterId === receiverId) {
        return res.status(400).json({ error: 'Cannot send request to yourself.' });
    }

    try {
        // Check if receiver exists
        const receiverExists = await dbGet(`SELECT id FROM users WHERE id = ?`, [receiverId]);
        if (!receiverExists) {
            return res.status(404).json({ message: 'Target user not found.' });
        }

        const existingFriendship = await dbGet(`
            SELECT status FROM friendships
            WHERE (requester_id = ? AND receiver_id = ?)
            OR (requester_id = ? AND receiver_id = ?)
        `, [requesterId, receiverId, receiverId, requesterId]);

        if (existingFriendship) {
            if (existingFriendship.status === 'pending') {
                return res.status(409).json({ message: 'Friend request already pending.' });
            } else if (existingFriendship.status === 'accepted') {
                return res.status(409).json({ message: 'Already friends.' });
            }
        }

        await dbRun(`INSERT INTO friendships (requester_id, receiver_id, status) VALUES (?, ?, 'pending')`, [requesterId, receiverId]);
        res.status(201).json({ message: 'Friend request sent.' });
    } catch (err) {
        console.error('Error sending friend request:', err);
        res.status(500).json({ error: 'Failed to send friend request.' });
    }
});

// PUT accept friend request
router.put('/friend-request/:id/accept', verifyToken, async (req, res) => {
    const receiverId = req.user.id; // The user accepting the request
    const requesterId = parseInt(req.params.id); // The user who sent the request

    if (isNaN(requesterId)) {
        return res.status(400).json({ error: 'Invalid user ID.' });
    }

    try {
        // Update the status in the main 'friendships' table
        const result = await dbRun(`
            UPDATE friendships
            SET status = 'accepted'
            WHERE requester_id = ? AND receiver_id = ? AND status = 'pending'
        `, [requesterId, receiverId]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Pending friend request not found or already accepted.' });
        }

        // Retrieve user details (especially email and name) for both users
        const [requesterUser, receiverUser] = await Promise.all([
            dbGet(`SELECT id, name, email FROM users WHERE id = ?`, [requesterId]),
            dbGet(`SELECT id, name, email FROM users WHERE id = ?`, [receiverId])
        ]);

        if (!requesterUser || !receiverUser) {
            console.error('User data not found for adding to individual friend dbs after accept.');
            // Even if user data is missing, the main friendship is established.
            // We return 500 but the core action is done.
            return res.status(500).json({ error: 'Failed to complete friend acceptance (user data missing for individual dbs).' });
        }

        // Open and update individual friends.db files for both users
        const requesterFriendDb = await getFriendDb(requesterUser.email);
        const receiverFriendDb = await getFriendDb(receiverUser.email);

        const friendDbRunRequester = promisify(requesterFriendDb.run).bind(requesterFriendDb);
        const friendDbRunReceiver = promisify(receiverFriendDb.run).bind(receiverFriendDb);

        // Add each user to the other's my_friends table. Use INSERT OR IGNORE to prevent duplicates.
        await friendDbRunRequester(`INSERT OR IGNORE INTO my_friends (id, username) VALUES (?, ?)`, [receiverUser.id, receiverUser.name]);
        await friendDbRunReceiver(`INSERT OR IGNORE INTO my_friends (id, username) VALUES (?, ?)`, [requesterUser.id, requesterUser.name]);

        // Close the individual friendDb connections
        requesterFriendDb.close();
        receiverFriendDb.close();

        res.json({ message: 'Friend request accepted.' });
    } catch (err) {
        console.error('Error accepting friend request:', err);
        res.status(500).json({ error: 'Failed to accept friend request.' });
    }
});

// DELETE cancel/decline friend request
router.delete('/friend-request/:id', verifyToken, async (req, res) => {
    const loggedInUserId = req.user.id; // User performing the action (cancelling or declining)
    const targetUserId = parseInt(req.params.id); // The other user involved in the request

    if (isNaN(targetUserId)) {
        return res.status(400).json({ error: 'Invalid user ID.' });
    }

    try {
        // Delete the pending request. It can be a request sent by loggedInUserId or received by loggedInUserId.
        const result = await dbRun(`
            DELETE FROM friendships
            WHERE (requester_id = ? AND receiver_id = ? AND status = 'pending')
            OR (requester_id = ? AND receiver_id = ? AND status = 'pending') 
        `, [loggedInUserId, targetUserId, targetUserId, loggedInUserId]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Pending friend request not found.' });
        }

        res.json({ message: 'Friend request cancelled/declined.' });
    } catch (err) {
        console.error('Error cancelling/declining friend request:', err);
        res.status(500).json({ error: 'Failed to cancel/decline friend request.' });
    }
});

// DELETE unfriend a user
router.delete('/friend/:id', verifyToken, async (req, res) => {
    const loggedInUserId = req.user.id;
    const targetUserId = parseInt(req.params.id);

    if (isNaN(targetUserId)) {
        return res.status(400).json({ error: 'Invalid user ID.' });
    }

    try {
        // Step 1: Delete the friendship from the main 'friendships' table
        // This handles both (loggedInUserId -> targetUserId) and (targetUserId -> loggedInUserId) entries
        const result = await dbRun(`
            DELETE FROM friendships
            WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))
            AND status = 'accepted'
        `, [loggedInUserId, targetUserId, targetUserId, loggedInUserId]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Not friends with this user.' });
        }

        // Step 2: Remove from individual friends.db files
        // Retrieve emails to get correct friendDb paths
        const [loggedInUser, targetUser] = await Promise.all([
            dbGet(`SELECT email FROM users WHERE id = ?`, [loggedInUserId]),
            dbGet(`SELECT email FROM users WHERE id = ?`, [targetUserId])
        ]);

        if (!loggedInUser || !targetUser) {
            console.error('User emails not found for removing from individual friend dbs after unfriend.');
            // This is a serious inconsistency, but we've already deleted from friendships.
            // Still, return an error to indicate partial failure.
            return res.status(500).json({ error: 'Failed to complete unfriend operation (user data missing for individual dbs).' });
        }

        // Get and await friendDb instances for both users
        const loggedInFriendDb = await getFriendDb(loggedInUser.email);
        const targetFriendDb = await getFriendDb(targetUser.email);

        // Promisify run methods for these specific friendDb instances
        const friendDbRunLoggedIn = promisify(loggedInFriendDb.run).bind(loggedInFriendDb);
        const friendDbRunTarget = promisify(targetFriendDb.run).bind(targetFriendDb);

        // Delete friend from both individual friend dbs
        await friendDbRunLoggedIn(`DELETE FROM my_friends WHERE id = ?`, [targetUserId]);
        await friendDbRunTarget(`DELETE FROM my_friends WHERE id = ?`, [loggedInUserId]);

        // Close the individual friendDb connections
        loggedInFriendDb.close();
        targetFriendDb.close();

        res.json({ message: 'Unfriended successfully.' });
    } catch (err) {
        console.error('Error unfriending:', err);
        res.status(500).json({ error: 'Failed to unfriend.' });
    }
});
// GET incoming friend requests
router.get('/friend-requests/incoming', verifyToken, async (req, res) => {
    const receiverId = req.user.id;
    try {
        const incomingRequests = await dbAll(`
            SELECT f.requester_id AS id, u.name AS username
            FROM friendships f
            JOIN users u ON f.requester_id = u.id
            WHERE f.receiver_id = ? AND f.status = 'pending'
        `, [receiverId]);
        res.json(incomingRequests);
    } catch (err) {
        console.error('Error fetching incoming friend requests:', err);
        res.status(500).json({ error: 'Failed to fetch incoming friend requests.' });
    }
});

module.exports = router;
