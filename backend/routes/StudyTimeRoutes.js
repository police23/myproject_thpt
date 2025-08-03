const express = require('express');
const router = express.Router();
const StudyTimeController = require('../controllers/StudyTimeController');

// Route để bắt đầu session học
router.post('/start-session', StudyTimeController.startSession);

// Route để kết thúc session học
router.post('/end-session', StudyTimeController.endSession);

module.exports = router;
