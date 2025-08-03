const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Lưu file vào thư mục uploads ở root workspace
        const workspaceRoot = path.resolve(__dirname, '../../');
        const uploadDir = path.join(workspaceRoot, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Lọc file
const fileFilter = (req, file, cb) => {
    // Chỉ cho phép upload hình ảnh
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // giới hạn 5MB
    }
});

module.exports = upload;
