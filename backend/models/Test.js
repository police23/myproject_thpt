const mongoose = require('mongoose');

// Check if the model already exists before defining it
const TestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        default: 90
    },
    numQuestions: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'public'],
        default: 'draft'
    },
    note: {
        type: String
    },
    sections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    }],
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Use this pattern to prevent the "OverwriteModelError"
module.exports = mongoose.models.Test || mongoose.model('Test', TestSchema);
