const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  answers: [
    {
      section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
      answers: [
        {
          question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
          user_answer: String
        }
      ]
    }
  ],
  score: Number,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
