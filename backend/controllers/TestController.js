const TestService = require('../services/TestService');

exports.createTest = async (req, res) => {
    try {
        // Nếu có file ảnh, lấy đường dẫn
        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }
        // Truyền imagePath vào testData
        const testData = { ...req.body, image: imagePath };
        const test = await TestService.createTest(testData);
        // Gửi thông báo realtime cho tất cả user
        const { sendNotificationToAll } = require('../socket');
        sendNotificationToAll({
            title: 'Có đề thi mới',
            content: `Đề thi mới "${test.title}" đã được đăng!`
        });
        res.status(201).json({
            success: true,
            message: 'Đã tạo đề thi thành công',
            testId: test._id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi tạo đề thi',
            error: error.message
        });
    }
};

exports.getAllTests = async (req, res) => {
    try {
        const tests = await TestService.getAllTests();
        res.status(200).json({
            success: true,
            count: tests.length,
            tests
        });
    } catch (error) {
       
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi truy vấn đề thi',
            error: error.message
        });
    }
};

exports.getTestById = async (req, res) => {
    try {
        const test = await TestService.getTestById(req.params.id);

        if (!test) {
            return res.status(404).json({ success: false, message: 'Đề thi không tồn tại' });
        }
        
        
        return res.json({
            success: true,
            test: test
        });
    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: `Error fetching test: ${error.message}`
        });
    }
};

exports.updateTest = async (req, res) => {
    try {
        // Nếu có file ảnh, lấy đường dẫn
        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }
        // Truyền imagePath vào updateData
        const updateData = { ...req.body, image: imagePath };
        const updatedTest = await TestService.updateTest(req.params.id, updateData);
        if (!updatedTest) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đề thi'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cập nhật đề thi thành công',
            test: updatedTest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật đề thi',
            error: error.message
        });
    }
};

exports.deleteTest = async (req, res) => {
    try {
        const result = await TestService.deleteTest(req.params.id);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đề thi'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Đã xóa đề thi thành công'
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa đề thi',
            error: error.message
        });
    }
};

// Nộp bài, chấm điểm, trả về kết quả chi tiết
exports.submitExam = async (req, res) => {
    try {
        const { examId, answers, timeSpent } = req.body;
        const userId = req.user?._id || req.body.userId || null;
        
        
        const result = await TestService.submitExam({ examId, answers, userId, timeSpent });
        return res.json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// Get all results for a student
exports.getResults = async (req, res) => {
    try {
        const userId =  req.query.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin người dùng'
            });
        }
        const results = await TestService.getStudentResults(userId);
        return res.json(results);
    } catch (err) {

        return res.status(500).json({ 
            success: false, 
            message: 'Đã xảy ra lỗi khi lấy kết quả bài thi' 
        });
    }
};

exports.getResultByTestId = async (req, res) => {
    try {
        const testId = req.params.testId;
        const userId = req.query.userId;
        
        if (!userId || !testId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin người dùng hoặc bài thi'
            });
        }
        
        const result = await TestService.getStudentResultByTestId(testId, userId);
        return res.json(result);
    } catch (err) {
        
        return res.status(500).json({ 
            success: false, 
            message: 'Đã xảy ra lỗi khi lấy kết quả bài thi' 
        });
    }
};

// Get specific result by result ID
exports.getResultByResultId = async (req, res) => {
    try {
        const resultId = req.params.resultId;
        const userId = req.query.userId;
        
        if (!userId || !resultId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin người dùng hoặc ID kết quả'
            });
        }
        
        const result = await TestService.getStudentResultByResultId(resultId, userId);
        
        return res.json(result);
    } catch (err) {
        
        return res.status(500).json({ 
            success: false, 
            message:  'Đã xảy ra lỗi khi lấy kết quả bài thi' 
        });
    }
};

