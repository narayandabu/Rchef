const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const JWT_SECRET =  'your-secret-key'; //process.env.JWT_SECRET || 'your-secret-key';
const dbPath = path.join(__dirname, '..', 'database', 'users.db');
const db = new sqlite3.Database(dbPath);

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email.endsWith('@gmail.com')) {
    return res.status(400).json({ success: false, message: 'Only Gmail addresses allowed.' });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (user) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashedPassword], function (err) {
      if (err) return res.status(500).json({ success: false });

      const userDir = path.join(__dirname, '..', 'database', email);
      const chatDBPath = path.join(userDir, 'chats.db');

      if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

      const chatDB = new sqlite3.Database(chatDBPath);
      chatDB.run(`CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_message TEXT NOT NULL,
        bot_reply TEXT NOT NULL,
        tool_name TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
      `);
      return res.status(201).json({ success: true, message: 'User created' });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
    return res.status(200).json({ success: true, token });
  });
};

exports.logout = (req, res) => {
  return res.status(200).json({ message: 'Logout successful' });
};
