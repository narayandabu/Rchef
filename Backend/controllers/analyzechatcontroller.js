const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Helper: Database path
function getAnalyzeDBPath(email) {
  const userDir = path.join(__dirname, `../database/${email}`);
  fs.mkdirSync(userDir, { recursive: true });
  return path.join(userDir, 'analyzechats.db');
}

// Helper: Initialize database
function initializeAnalyzeDB(dbPath) {
  const db = new sqlite3.Database(dbPath);
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT,
      text TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      session_id TEXT,
      session_name TEXT
    )
  `);
  return db;
}

// Save a message
function saveAnalyzeMessage(email, sender, text, sessionId, sessionName, timestamp) {
  const dbPath = getAnalyzeDBPath(email);
  const db = initializeAnalyzeDB(dbPath);

  const stmt = db.prepare(`
    INSERT INTO messages (sender, text, timestamp, session_id, session_name)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(sender, text, timestamp, sessionId, sessionName, (err) => {
    if (err) console.error('Error saving message:', err);
  });
  stmt.finalize();
  db.close();
}

// Get messages by session_id
function getAnalyzeMessagesBySession(email, sessionId, callback) {
  const dbPath = getAnalyzeDBPath(email);
  const db = initializeAnalyzeDB(dbPath);

  db.all(`
    SELECT * FROM messages
    WHERE session_id = ?
    ORDER BY timestamp ASC
  `, [sessionId], (err, rows) => {
    if (err) {
      console.error('Error fetching messages:', err);
      callback([]);
    } else {
      callback(rows);
    }
    db.close();
  });
}

// Get all sections
function getAllAnalyzeSections(email, callback) {
  const dbPath = getAnalyzeDBPath(email);
  const db = initializeAnalyzeDB(dbPath);

  db.all(`SELECT DISTINCT session_name, session_id FROM messages`, [], (err, rows) => {
    if (err) {
      console.error('Error fetching sections:', err);
      callback([]);
    } else {
      callback(rows);
    }
    db.close();
  });
}

// Rename a section
function renameAnalyzeSection(email, sectionId, newName, callback) {
  const dbPath = getAnalyzeDBPath(email);
  const db = initializeAnalyzeDB(dbPath);

  db.run(`
    UPDATE messages
    SET session_name = ?
    WHERE session_id = ?
  `, [newName, sectionId], (err) => {
    callback(!err);
    db.close();
  });
}

// Delete a section
function deleteAnalyzeSection(email, sectionId, callback) {
  const dbPath = getAnalyzeDBPath(email);
  const db = initializeAnalyzeDB(dbPath);

  db.run(`
    DELETE FROM messages
    WHERE session_id = ?
  `, [sectionId], (err) => {
    callback(!err);
    db.close();
  });
}

module.exports = {
  saveAnalyzeMessage,
  getAnalyzeMessagesBySession,
  getAllAnalyzeSections,
  renameAnalyzeSection,
  deleteAnalyzeSection
};
