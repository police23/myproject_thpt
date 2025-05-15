const express = require('express');
const router = express.Router();
const TestController = require('../controllers/TestController');

// Test routes
router.post('/', TestController.createTest);
router.get('/', TestController.getAllTests);
router.get('/:id', TestController.getTestById);
router.put('/:id', TestController.updateTest);
router.delete('/:id', TestController.deleteTest);

module.exports = router;
