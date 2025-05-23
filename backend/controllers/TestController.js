const TestService = require('../services/TestService');

exports.createTest = async (req, res) => {
    try {
        const test = await TestService.createTest(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Đã tạo đề thi thành công',
            testId: test._id
        });

    } catch (error) {
        console.error('Error creating test:', error);
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
        console.error('Error fetching tests:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi truy vấn đề thi',
            error: error.message
        });
    }
};

exports.getTestById = async (req, res) => {
    try {
        console.log(`Looking up test with ID: ${req.params.id}`);
        
        const test = await TestService.getTestById(req.params.id);

        if (!test) {
            console.log(`Test with ID ${req.params.id} not found`);
            return res.status(404).json({ success: false, message: 'Đề thi không tồn tại' });
        }
        
        console.log(`Found test: ${test.title} with ${test.sections.length} sections`);
        
        return res.json({
            success: true,
            test: test
        });
    } catch (error) {
        console.error('Error fetching test by ID:', error);
        return res.status(500).json({
            success: false,
            message: `Error fetching test: ${error.message}`
        });
    }
};

exports.updateTest = async (req, res) => {
    try {
        console.log('Updating test - Received data:', {
            testId: req.params.id,
            name: req.body.name,
            subject: req.body.subject,
            duration: req.body.duration,
            status: req.body.status
        });
        console.log('Questions count:', req.body.questions.length);

        const updatedTest = await TestService.updateTest(req.params.id, req.body);
        
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
        console.error('Error updating test:', error);
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
        console.error('Error deleting test:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa đề thi',
            error: error.message
        });
    }
};
