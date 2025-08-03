const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    title: String, 
    subject: String,
    description: String,
    duration: { type: Number, default: 90 },
    status: { type: String, enum: ['public', 'draft'], default: 'draft' },
    note: String,
    numQuestions: { type: Number, default: 0 },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Test', testSchema);
