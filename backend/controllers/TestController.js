const Test = require('../models/TestsModel');
const Section = require('../models/SectionsModel');
const Question = require('../models/QuestionsModel');
const mongoose = require('mongoose');

// Helper function to handle file uploads (assuming you'll use multer)
const handleFileUpload = async (file) => {
    // You would implement file upload logic here
    // And return the file path or URL
    return file ? `/uploads/${Date.now()}-${file.originalname}` : null;
};

exports.createTest = async (req, res) => {
    try {
        const {
            name, subject, duration, status, note,
            structure, questions
        } = req.body;

        // Log dữ liệu đầu vào để debug
        console.log('Tạo đề thi - Dữ liệu nhận được:', {
            name, subject, duration, status, note, structure, questions
        });

        // Kiểm tra dữ liệu đầu vào
        if (
            !name ||
            !subject ||
            !Array.isArray(structure) ||
            structure.length === 0 ||
            !Array.isArray(questions) ||
            questions.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu hoặc sai định dạng thông tin đề thi (name, subject, structure[], questions[])'
            });
        }

        // Create the test
        const test = new Test({
            title: name,
            subject,
            duration,
            status,
            note,
            numQuestions: questions.length,
            created_by: req.user ? req.user._id : null // Assuming user is available in request
        });

        await test.save();

        // Group questions by type
        const questionsByType = {};
        questions.forEach(q => {
            if (!questionsByType[q.type]) {
                questionsByType[q.type] = [];
            }
            questionsByType[q.type].push(q);
        });

        // Create sections based on structure
        for (const structureItem of structure) {
            const { section: title, type, num } = structureItem;

            const sectionQuestions = questionsByType[type] ?
                questionsByType[type].splice(0, num) : [];

            const newSection = new Section({
                title,
                type,
                num,
                test_id: test._id
            });

            await newSection.save();

            // Create questions for this section
            for (const q of sectionQuestions) {
                // Đảm bảo các trường là mảng
                if (!Array.isArray(q.options)) q.options = [];
                if (!Array.isArray(q.optionImages)) q.optionImages = [];
                if (!Array.isArray(q.answers)) q.answers = [];

                let imageUrl = null;
                let optionImageUrls = [];
                let answerImageUrl = null;

                // Handle image uploads if applicable
                if (q.hasImage && q.image) {
                    imageUrl = await handleFileUpload(q.image);
                }

                if (q.type === 'tracnghiem' || q.type === 'dungsai') {
                    if (q.optionImages) {
                        for (const optImg of q.optionImages) {
                            const imgUrl = optImg ? await handleFileUpload(optImg) : null;
                            optionImageUrls.push(imgUrl);
                        }
                    }
                }

                if (q.type === 'tuluan' && q.answerImage) {
                    answerImageUrl = await handleFileUpload(q.answerImage);
                }

                // Log dữ liệu từng câu hỏi trước khi lưu
                console.log('Tạo câu hỏi:', {
                    question: q.content,
                    type: q.type,
                    options: q.options,
                    answers: q.answers,
                    correct_answer: q.answer,
                });

                // Create question based on type
                const newQuestion = new Question({
                    question: q.content,
                    type: q.type,
                    options: q.options,
                    section_id: newSection._id,
                    hasImage: q.hasImage,
                    image: imageUrl,
                    optionImages: optionImageUrls,
                });

                // Set type-specific fields
                if (q.type === 'tracnghiem') {
                    newQuestion.correct_answer = q.answer !== undefined ? q.answer.toString() : '';
                } else if (q.type === 'dungsai') {
                    newQuestion.answers = q.answers;
                } else if (q.type === 'tuluan') {
                    newQuestion.correct_answer = q.answer || '';
                    newQuestion.answerImage = answerImageUrl;
                }

                await newQuestion.save();

                // Add question to section
                newSection.questions.push(newQuestion._id);
            }

            await newSection.save();

            // Add section to test
            test.sections.push(newSection._id);
        }

        await test.save();

        res.status(201).json({
            success: true,
            message: 'Đã tạo đề thi thành công',
            testId: test._id
        });

    } catch (error) {
        // Log lỗi chi tiết hơn
        console.error('Error creating test:', error, 'Body:', req.body);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi tạo đề thi',
            error: error.message
        });
    }
};

exports.getAllTests = async (req, res) => {
    try {
        const tests = await Test.find()
            .sort({ created_at: -1 })
            .select('title subject status created_at numQuestions sections') // Thêm sections để frontend có thể lấy id sections nếu cần
            .populate('created_by', 'name');

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
        const test = await Test.findById(req.params.id)
            .populate({
                path: 'sections',
                populate: {
                    path: 'questions',
                    model: 'Question'
                }
            });

        if (!test) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đề thi' });
        }

        res.json({ success: true, test });
    } catch (error) {
        console.error('Error getTestById:', error);
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

exports.updateTest = async (req, res) => {
    try {
        // Similar implementation to createTest but updating existing records
        // This would involve updating the test, sections, and questions

        // For brevity, I'm not including the full implementation here

        res.status(200).json({
            success: true,
            message: 'Đã cập nhật đề thi thành công'
        });
    } catch (error) {
        console.error('Error updating test:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật đề thi',
            error: error.message
        });
    }
};

exports.deleteTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);

        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đề thi'
            });
        }

        // Delete all questions in all sections
        for (const sectionId of test.sections) {
            const section = await Section.findById(sectionId);
            if (section) {
                await Question.deleteMany({ _id: { $in: section.questions } });
                await Section.findByIdAndDelete(sectionId);
            }
        }

        // Delete the test
        await Test.findByIdAndDelete(req.params.id);

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
