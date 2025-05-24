const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');

// Helper: Initialize chats.db
function initializeChatsDB(userDir) {
  const chatDBPath = path.join(userDir, 'chats.db');
  const chatDB = new sqlite3.Database(chatDBPath);
  chatDB.run(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_message TEXT NOT NULL,
      bot_reply TEXT NOT NULL,
      tool_name TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Helper: Initialize analyzechats.db
function initializeAnalyzeDB(userDir) {
  const analyzeDBPath = path.join(userDir, 'analyzechats.db');
  const analyzeDB = new sqlite3.Database(analyzeDBPath);
  analyzeDB.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT,
      text TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      session_id TEXT,
      session_name TEXT
    )
  `);
}

// Helper: Initialize notifications.db
function initializeNotificationsDB(userDir) {
  const notificationsDBPath = path.join(userDir, 'notifications.db');
  const notifDB = new sqlite3.Database(notificationsDBPath);
  notifDB.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      read BOOLEAN DEFAULT 0,
      type TEXT,
      tool TEXT,
      route TEXT
    )
  `);
}

// Helper: Initialize main.db with liked_papers
function initializeMainDB(userDir) {
  const mainDBPath = path.join(userDir, 'main.db');
  const mainDB = new sqlite3.Database(mainDBPath);
  mainDB.run(`
    CREATE TABLE IF NOT EXISTS liked_papers (
      paper_id TEXT PRIMARY KEY,
      is_liked BOOLEAN DEFAULT 0
    )
  `);
}

// ✅ Master function to call on signup
function initializeUserData(email) {
  const userDir = path.join(__dirname, '..', 'database', email);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  initializeChatsDB(userDir);
  initializeAnalyzeDB(userDir);
  initializeNotificationsDB(userDir);
  initializeMainDB(userDir);
}
exports.initializeUserData = initializeUserData;