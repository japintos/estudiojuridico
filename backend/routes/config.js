const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { getEmailScheduleConfig, updateEmailScheduleConfig } = require('../controllers/configController');

router.use(authenticateToken);

router.get('/email-schedule', authorizeRole('abogado', 'secretaria'), getEmailScheduleConfig);
router.put('/email-schedule', authorizeRole('abogado', 'secretaria'), updateEmailScheduleConfig);

module.exports = router;

