const express = require('express');
const router = express.Router();
const TestController = require('../controllers/TestController');
const upload = require('../middlewares/uploadMiddleware');

// Routes cho đề thi với hỗ trợ upload nhiều hình ảnh
router.get('/', TestController.getAllTests);
router.get('/:id', TestController.getTestById);
router.post('/', upload.array('images', 50), TestController.createTest);
router.put('/:id', upload.array('images', 50), TestController.updateTest);
router.delete('/:id', TestController.deleteTest);

module.exports = router;
