const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  saveAnalyzeMessage,
  getAnalyzeMessagesBySession,
  getAllAnalyzeSections,
  renameAnalyzeSection,
  deleteAnalyzeSection
} = require('../controllers/analyzechatcontroller');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userFolder = path.join(__dirname, `../database/${req.user.email}/uploads`);
    fs.mkdirSync(userFolder, { recursive: true });
    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${path.basename(file.originalname, ext)}-${timestamp}${ext}`);
  }
});
const upload = multer({ storage });

// Save a chat message
router.post('/chat/save', verifyToken, (req, res) => {
  const { sender, text, session_id, session_name, timestamp } = req.body;
  const email = req.user.email;

  if (!sender || !text || !session_id || !timestamp) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  saveAnalyzeMessage(email, sender, text, session_id, session_name, timestamp);
  res.json({ message: 'Message saved' });
});

// Get chat history by session
router.get('/history/:session_id', verifyToken, (req, res) => {
  const sessionId = req.params.session_id;
  const email = req.user.email;

  getAnalyzeMessagesBySession(email, sessionId, (messages) => {
    res.json({ messages });
  });
});

// Get all user sections
router.get('/sections', verifyToken, (req, res) => {
  const email = req.user.email;

  getAllAnalyzeSections(email, (sections) => {
    res.json({ sections });
  });
});

// Get all sessions (just fetching all sections for now)
router.get('/chats', verifyToken, (req, res) => {
  const email = req.user.email;

  getAllAnalyzeSections(email, (sections) => {
    res.json({ sessions: sections });
  });
});

// Upload PDF
router.post('/upload', verifyToken, upload.single('pdf'), (req, res) => {
  try {
    const file = req.file;
    const email = req.user.email;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // const timestamp = new Date().toISOString();
    // const originalName = path.basename(file.originalname, path.extname(file.originalname));
    // const sessionId = `${originalName}-${Date.now()}`;
    const sessionName = `Analyze PDF - ${file.originalname}`;
    // const user = 'user';
    // saveAnalyzeMessage(email, user, `Uploaded file: ${file.originalname}`, sessionId, sessionName, timestamp);

    res.json({
      message: `Successfully uploaded: ${file.originalname}`,
      sessionName: sessionName,
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rename a section
router.post('/section/rename', verifyToken, (req, res) => {
  const email = req.user.email;
  const { sectionId, newName } = req.body;

  renameAnalyzeSection(email, sectionId, newName, (success) => {
    if (success) {
      res.json({ message: 'Section renamed' });
    } else {
      res.status(500).json({ error: 'Failed to rename section' });
    }
  });
});

// Delete a section
router.post('/section/delete', verifyToken, (req, res) => {
  const email = req.user.email;
  const { sectionId } = req.body;

  deleteAnalyzeSection(email, sectionId, (success) => {
    if (success) {
      res.json({ message: 'Section deleted' });
    } else {
      res.status(500).json({ error: 'Failed to delete section' });
    }
  });
});

module.exports = router;
