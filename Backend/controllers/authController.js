const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { initializeUserData } = require('../utils/initialize_db');

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
      initializeUserData(email);
      return res.status(201).json({ success: true, message: 'User created' });
    });
  });
};

exports.login = async(req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // const hashedPassword = await bcrypt.hash(password, 10);
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
    return res.status(200).json({ success: true, token ,email:email});
  });
};

exports.logout = (req, res) => {
  return res.status(200).json({ message: 'Logout successful' });
};
