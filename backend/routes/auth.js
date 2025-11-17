const express = require('express');
const router = express.Router();
const { login, getCurrentUser, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;

