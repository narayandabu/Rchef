const express = require('express');
const { handleChat, getHistory } = require('../controllers/chatController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/chat', verifyToken, handleChat);
router.get('/history', verifyToken, getHistory);

module.exports = router;
