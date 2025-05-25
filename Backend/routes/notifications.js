// routes/notifications.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const router = express.Router();
const authenticateToken = require('../middleware/verifyToken');

// Utility to get user DB path
function getNotificationDBPath(email) {
  const userFolder = path.join(__dirname, `../database/${email}`);
  if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true });
  return path.join(userFolder, 'notifications.db');
}
const find_by_id = async(userid)=> {
  const dbPath = path.join(__dirname,'../database/users.db');
  const db = new sqlite3.Database(dbPath);
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE id = ?`, [userid], (err, row) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        return resolve(row.email);
      }
    });
  });
}
// Create table if not exists
function ensureTable(db) {
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT 0,
    type TEXT,
    tool TEXT,
    route TEXT
  )`);
}

// POST /api/notifications/push
router.post('/push', authenticateToken, async(req, res) => {
  const { content, type, tool, route, reciever_id} = req.body;
  if(reciever_id && reciever_id !== req.user.email) {
    await find_by_id(reciever_id).then((email) => {
      const dbPath = getNotificationDBPath(email);
      const db = new sqlite3.Database(dbPath);
      console.log(email);
      ensureTable(db);
      db.run(
        `INSERT INTO notifications (content, type, tool, route) VALUES (?, ?, ?, ?)`,
        [content + email, type, tool, route],
        function (err) {
          db.close();
          if (err) return res.status(500).json({ message: 'Failed to push notification' });
          res.json({ success: true, id: this.lastID });
        }
      );
    });
  }
  else{ 
    const user_email = req.user.email;
    const dbPath = getNotificationDBPath(user_email);
    const db = new sqlite3.Database(dbPath);

    ensureTable(db);

    db.run(
      `INSERT INTO notifications (content, type, tool, route) VALUES (?, ?, ?, ?)`,
      [content, type, tool, route],
      function (err) {
        db.close();
        if (err) return res.status(500).json({ message: 'Failed to push notification' });
        res.json({ success: true, id: this.lastID });
      }
    );
  }
});

// GET /api/notifications
router.get('/', authenticateToken, (req, res) => {
  const email = req.user.email;
  const dbPath = getNotificationDBPath(email);
  const db = new sqlite3.Database(dbPath);
  ensureTable(db);
  db.all(`SELECT * FROM notifications WHERE read<1 ORDER BY timestamp DESC LIMIT 50`, [], (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ message: 'Fetch error' });

    res.json(rows);
  });
});

// PATCH /api/notifications/mark-read/:id
router.patch('/mark-read/:id', authenticateToken, (req, res) => {
  const email = req.user.email;
  const id = req.params.id;
  const dbPath = getNotificationDBPath(email);
  const db = new sqlite3.Database(dbPath);
  ensureTable(db);
  db.run(`UPDATE notifications SET read = 1 WHERE id = ?`, [id], function (err) {
    db.close();
    if (err) return res.status(500).json({ message: 'Failed to mark read' });
    res.json({ success: true });
  });
});

module.exports = router;
