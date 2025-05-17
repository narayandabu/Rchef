const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/papers.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    authors TEXT,
    abstract TEXT,
    journal TEXT,
    year INTEGER,
    link TEXT UNIQUE,
    source TEXT,
    tags TEXT
  )`);
});

module.exports = db;
