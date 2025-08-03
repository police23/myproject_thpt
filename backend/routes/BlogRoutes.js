const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/BlogController');
const multer = require('multer');
const path = require('path');
// Cấu hình lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog_' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
router.get('/', BlogController.getAllBlogs);
router.get('/:id', BlogController.getBlogById);
router.post('/', upload.single('image'), BlogController.createBlog);
router.put('/:id', upload.single('image'), BlogController.updateBlog);
router.delete('/:id', BlogController.deleteBlog);

module.exports = router;