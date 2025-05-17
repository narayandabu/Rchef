const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log("DB Chat Initialized...");
function getUserChatDB(email) {
  const chatPath = path.join(__dirname, '..', 'database', email, 'chats.db');
  return new sqlite3.Database(chatPath);
}

function initializeUserDB() {
  const dbPath = path.join(__dirname, '..', 'database', 'users.db');
  const db = new sqlite3.Database(dbPath);
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, password TEXT)`);
}

module.exports = { getUserChatDB, initializeUserDB };
