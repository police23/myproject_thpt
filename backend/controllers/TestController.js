const Test = require('../models/Test');
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
            name, subject, duration, status, note, structure, questions
        } = req.body;

        // Create the test first
        const test = new Test({
            title: name,
            subject,
            duration: parseInt(duration) || 90,
            status,
            note,
            numQuestions: questions.length
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

        // Process each section in structure
        for (const sectionData of structure) {
            if (parseInt(sectionData.num) <= 0) continue;
            
            // Create a new section
            const newSection = new Section({
                title: sectionData.section,
                type: sectionData.type,
                num: parseInt(sectionData.num) || 0,
                pointsPerQuestion: parseFloat(sectionData.pointsPerQuestion) || 0,
                points: parseFloat(sectionData.points) || 0,
                test_id: test._id // Important: Link section to test
            });
            
            await newSection.save();
            
            // Get questions for this section type
            const sectionQuestions = questionsByType[sectionData.type] || [];
            const sectionQuestionCount = Math.min(parseInt(sectionData.num) || 0, sectionQuestions.length);
            
            // Create questions for this section
            for (let i = 0; i < sectionQuestionCount; i++) {
                const q = sectionQuestions[i];
                
                const questionData = {
                    question: q.content,
                    type: q.type,
                    section_id: newSection._id,
                    test_id: test._id, // Important: Link question to test
                    hasImage: q.hasImage || false,
                    image: q.imagePreview
                };
                
                // Add type-specific fields
                if (q.type === 'tracnghiem') {
                    questionData.options = q.options || [];
                    questionData.correct_answer = q.answer?.toString() || '0';
                    questionData.optionImages = q.optionImagePreviews || [];
                } else if (q.type === 'dungsai') {
                    questionData.options = q.options || [];
                    questionData.answers = q.answers || [false, false, false, false];
                    questionData.optionImages = q.optionImagePreviews || [];
                } else if (q.type === 'tuluan') {
                    questionData.correct_answer = q.answer || '';
                    questionData.answerImage = q.answerImagePreview;
                }
                
                // Save the question
                const newQuestion = new Question(questionData);
                await newQuestion.save();
                
                // Add to section's questions
                newSection.questions.push(newQuestion._id);
            }
            
            // Update section with questions
            await Section.findByIdAndUpdate(newSection._id, { questions: newSection.questions });
            
            // Add section to test
            test.sections.push(newSection._id);
        }
        
        // Final save of test with section references
        await test.save();

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

// Khi trả về dữ liệu đề thi, đảm bảo section có đầy đủ các trường và questions
exports.getTestById = async (req, res) => {
    try {
        console.log(`Looking up test with ID: ${req.params.id}`);
        
        // Find the test with populated sections
        const test = await Test.findById(req.params.id)
            .populate({
                path: 'sections',
                populate: {
                    path: 'questions'
                }
            });

        if (!test) {
            console.log(`Test with ID ${req.params.id} not found`);
            return res.status(404).json({ success: false, message: 'Đề thi không tồn tại' });
        }
        
        console.log(`Found test: ${test.title} with ${test.sections.length} sections`);
        
        // Make sure all sections have valid questions array
        if (test.sections) {
            for (let i = 0; i < test.sections.length; i++) {
                if (!test.sections[i].questions) {
                    test.sections[i].questions = [];
                }
                
                // If questions don't exist in this section, try to find them by section_id
                if (test.sections[i].questions.length === 0) {
                    const sectionQuestions = await Question.find({ section_id: test.sections[i]._id });
                    test.sections[i].questions = sectionQuestions;
                    console.log(`Found ${sectionQuestions.length} questions for section ${test.sections[i].title} by section_id`);
                }
            }
        }
        
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
        const testId = req.params.id;
        const { name, subject, duration, status, note, structure, questions } = req.body;

        console.log('Updating test - Received data:', {
            testId, name, subject, duration, status
        });
        console.log('Questions count:', questions.length);

        const existingTest = await Test.findById(testId);
        if (!existingTest) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đề thi'
            });
        }

        // First, get all existing section IDs to delete later
        const oldSectionIds = [...existingTest.sections];
        
        // Clear sections from test
        existingTest.sections = [];
        
        // Update test basic info
        existingTest.title = name;
        existingTest.subject = subject;
        existingTest.duration = parseInt(duration) || 90;
        existingTest.status = status;
        existingTest.note = note;
        existingTest.numQuestions = questions.length;
        existingTest.updatedAt = new Date();
        
        // Save test to get reference
        await existingTest.save();
        
        // Group questions by type
        const questionsByType = {};
        questions.forEach(q => {
            if (!questionsByType[q.type]) {
                questionsByType[q.type] = [];
            }
            questionsByType[q.type].push(q);
        });
        
        // Create new sections and questions
        for (const sectionData of structure) {
            if (parseInt(sectionData.num) <= 0) continue;
            
            const newSection = new Section({
                title: sectionData.section,
                type: sectionData.type,
                num: parseInt(sectionData.num) || 0,
                pointsPerQuestion: parseFloat(sectionData.pointsPerQuestion) || 0,
                points: parseFloat(sectionData.points) || 0,
                test_id: existingTest._id // Important: Link section to test
            });
            
            await newSection.save();
            
            // Get questions for this section type
            const sectionQuestions = questionsByType[sectionData.type] || [];
            const sectionQuestionCount = Math.min(parseInt(sectionData.num) || 0, sectionQuestions.length);
            
            // Create questions for this section
            for (let i = 0; i < sectionQuestionCount; i++) {
                const q = sectionQuestions[i];
                
                const questionData = {
                    question: q.content,
                    type: q.type,
                    section_id: newSection._id,
                    test_id: existingTest._id, // Important: Link question to test
                    hasImage: q.hasImage || false,
                    image: q.imagePreview
                };
                
                // Add type-specific fields
                if (q.type === 'tracnghiem') {
                    questionData.options = q.options || [];
                    questionData.correct_answer = q.answer?.toString() || '0';
                    questionData.optionImages = q.optionImagePreviews || [];
                } else if (q.type === 'dungsai') {
                    questionData.options = q.options || [];
                    questionData.answers = q.answers || [false, false, false, false];
                    questionData.optionImages = q.optionImagePreviews || [];
                } else if (q.type === 'tuluan') {
                    questionData.correct_answer = q.answer || '';
                    questionData.answerImage = q.answerImagePreview;
                }
                
                // Save the question
                const newQuestion = new Question(questionData);
                await newQuestion.save();
                
                // Add to section's questions
                newSection.questions.push(newQuestion._id);
            }
            
            // Update section with questions
            await Section.findByIdAndUpdate(newSection._id, { questions: newSection.questions });
            
            // Add section to test
            existingTest.sections.push(newSection._id);
        }
        
        // Final save of test with section references
        await existingTest.save();
        
        // Now delete old sections and questions
        for (const sectionId of oldSectionIds) {
            // Delete questions linked to this section
            await Question.deleteMany({ section_id: sectionId });
            // Delete the section itself
            await Section.findByIdAndDelete(sectionId);
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật đề thi thành công',
            test: existingTest
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
