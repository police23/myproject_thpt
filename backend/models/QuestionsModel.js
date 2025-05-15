const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: String,
    type: { type: String, enum: ['tracnghiem', 'dungsai', 'tuluan'] }, // Updated to match frontend types
    options: [String], // For multiple-choice or true-false
    correct_answer: String, // For tracnghiem
    answers: [Boolean], // For dungsai (true/false for each option)
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    // Image support
    hasImage: { type: Boolean, default: false },
    image: { type: String }, // URL or path to image
    optionImages: [String], // URLs or paths to option images
    // For tuluan (short answer)
    answer_explanation: String,
    answerImage: { type: String } // URL or path to answer image
});

module.exports = mongoose.model('Question', questionSchema);
