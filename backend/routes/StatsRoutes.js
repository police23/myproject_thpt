const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/StatsController');
router.get('/stats', StatsController.getStats);
module.exports = router;
