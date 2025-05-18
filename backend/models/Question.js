const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    test_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    type: {
        type: String,
        enum: ['tracnghiem', 'dungsai', 'tuluan'],
        required: true
    },
    question: {
        type: String,
        required: true
    },
    // Cho câu hỏi trắc nghiệm
    options: [String],
    correct_answer: {
        type: mongoose.Schema.Types.Mixed // Có thể là số (index) hoặc chuỗi (đáp án)
    },
    // Cho câu hỏi đúng/sai
    answers: [Boolean],
    // Thông tin về hình ảnh
    hasImage: {
        type: Boolean,
        default: false
    },
    image: String,
    optionImages: [String],
    answerImage: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Question', QuestionSchema);
