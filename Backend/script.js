const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const mainDbPath = path.join(__dirname, './database/users.db');
const mainDb = new sqlite3.Database(mainDbPath);

const dbAll = promisify(mainDb.all).bind(mainDb);
const dbGet = promisify(mainDb.get).bind(mainDb);
const dbRun = promisify(mainDb.run).bind(mainDb);

// Helper function to get a user's specific friends database path
const getUserFriendDbPath = (userEmail) => {
    const userFolder = path.join(__dirname, './database', userEmail);
    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
        console.log(`Created directory: ${userFolder}`);
    }
    return path.join(userFolder, 'friends.db');
};

// Helper function to open and initialize a user's friends database
const getFriendDb = (userEmail) => {
    const friendDbPath = getUserFriendDbPath(userEmail);
    const friendDb = new sqlite3.Database(friendDbPath);
    const friendDbRun = promisify(friendDb.run).bind(friendDb);

    // Use serialize to ensure table creation runs before any inserts
    return new Promise((resolve, reject) => {
        friendDb.serialize(() => {
            friendDbRun(`
                CREATE TABLE IF NOT EXISTS my_friends (
                    id INTEGER PRIMARY KEY,
                    username TEXT NOT NULL
                )
            `)
            .then(() => resolve(friendDb))
            .catch(err => reject(err));
        });
    });
};

async function initializeFriendsDbs() {
    console.log('Starting initialization of friends.db files...');

    try {
        // 1. Get all users from the central users.db
        const users = await dbAll(`SELECT id, email, name AS username FROM users`);
        console.log(`Found ${users.length} users.`);

        // 2. Get all accepted friendships from the central friendships table
        const friendships = await dbAll(`
            SELECT requester_id, receiver_id, status FROM friendships WHERE status = 'accepted'
        `);
        console.log(`Found ${friendships.length} accepted friendships.`);

        // Create a map for quick user lookup by ID
        const userMap = new Map(users.map(u => [u.id, u]));

        // Iterate through each user and initialize their friends.db
        for (const user of users) {
            console.log(`Processing user: ${user.email} (ID: ${user.id})...`);
            let friendDb;
            try {
                friendDb = await getFriendDb(user.email);
                const friendDbRun = promisify(friendDb.run).bind(friendDb);
                const friendDbAll = promisify(friendDb.all).bind(friendDb);

                // Clear existing friends in this user's db (optional, useful for re-runs)
                await friendDbRun(`DELETE FROM my_friends`);

                // Find friends for the current user from the central friendships
                const userFriends = friendships.filter(f =>
                    (f.requester_id === user.id || f.receiver_id === user.id) && f.status === 'accepted'
                );

                for (const friendship of userFriends) {
                    const friendId = friendship.requester_id === user.id ? friendship.receiver_id : friendship.requester_id;
                    const friendUser = userMap.get(friendId);

                    if (friendUser) {
                        await friendDbRun(`INSERT OR IGNORE INTO my_friends (id, username) VALUES (?, ?)`, [friendUser.id, friendUser.username]);
                    } else {
                        console.warn(`Warning: Friend (ID: ${friendId}) not found in central users table for user ${user.id}.`);
                    }
                }
                console.log(`  Initialized ${userFriends.length} friends for ${user.email}.`);

            } catch (err) {
                console.error(`Error processing user ${user.email}:`, err);
            } finally {
                if (friendDb) {
                    friendDb.close();
                }
            }
        }

        console.log('Friends.db initialization complete.');

    } catch (err) {
        console.error('Error during friends.db initialization:', err);
    } finally {
        mainDb.close();
    }
}

// Run the script
initializeFriendsDbs();