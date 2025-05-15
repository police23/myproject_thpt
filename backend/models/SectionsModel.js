const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    title: String, // E.g. "Phần 1"
    type: { type: String, enum: ['tracnghiem', 'dungsai', 'tuluan'] }, // Match frontend types
    num: { type: Number, default: 0 }, // Number of questions in this section
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
});

module.exports = mongoose.model('Section', sectionSchema);
