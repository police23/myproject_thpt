const express = require('express');
const router = express.Router();
const TestController = require('../controllers/TestController');
const upload = require('../middlewares/uploadMiddleware');
router.post('/submitExam', TestController.submitExam);
router.get('/results', TestController.getResults);
router.get('/results/:testId', TestController.getResultByTestId);
router.get('/result/:resultId', TestController.getResultByResultId);
router.get('/', TestController.getAllTests);
router.get('/:id', TestController.getTestById);
router.post('/', upload.single('image'), TestController.createTest);
router.put('/:id', upload.single('image'), TestController.updateTest);
router.delete('/:id', TestController.deleteTest);

module.exports = router;
