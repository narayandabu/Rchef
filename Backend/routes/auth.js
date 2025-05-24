const express = require('express');
const { signup, login, logout } = require('../controllers/authController');
const authenticateToken = require('../middleware/verifyToken');

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user/profile',authenticateToken, (req, res) => {

  // This is a placeholder. You should implement the logic to get user profile data.
  res.status(200).json({ name: 'John Doe', email: ''});
});


module.exports = router;
