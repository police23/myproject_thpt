const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['tracnghiem', 'dungsai', 'tuluan'],
        required: true
    },
    num: {
        type: Number,
        required: true
    },
    pointsPerQuestion: {
        type: Number,
        default: 0.5
    },
    points: {
        type: Number,
        default: 0
    },
    test_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]
});

// Use this pattern to prevent the "OverwriteModelError"
module.exports = mongoose.models.Section || mongoose.model('Section', SectionSchema);
