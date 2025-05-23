const express = require('express');
const router = express.Router();
const TestController = require('../controllers/TestController');

// Routes cho đề thi
router.get('/', TestController.getAllTests);
router.get('/:id', TestController.getTestById);
router.post('/', TestController.createTest);
router.put('/:id', TestController.updateTest);
router.delete('/:id', TestController.deleteTest);

// Lưu ý: Gắn router này tại '/api/tests' trong tệp ứng dụng Express chính của bạn
// Ví dụ: app.use('/api/tests', testsRouter);

module.exports = router;
