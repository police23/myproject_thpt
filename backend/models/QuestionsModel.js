const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['tracnghiem', 'dungsai', 'tuluan'],
        required: true
    },
    options: [String],
    correct_answer: mongoose.Schema.Types.Mixed, // Có thể là String hoặc Number
    answers: [Boolean], // Cho câu hỏi đúng/sai
    hasImage: {
        type: Boolean,
        default: false
    },
    image: String,
    optionImages: [String],
    answerImage: String,
    section_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    test_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true // Làm cho test_id trở thành trường bắt buộc
    }
}, {
    toJSON: { virtuals: true }, // Đảm bảo virtuals được bao gồm khi chuyển sang JSON
    toObject: { virtuals: true }
});

// Đảm bảo không lưu lại model nếu đã tồn tại
module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
