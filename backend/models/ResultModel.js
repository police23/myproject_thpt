const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  answers: [
    {
      section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
      question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      user_answer: String,
      is_correct: Boolean
    }
  ],
  section_scores: [
    {
      section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
      score: Number
    }
  ],
  total_score: Number,
  time_taken: Number,
  start_time: Date,
  end_time: Date,
  created_at: { type: Date, default: Date.now }
});

// Use this pattern to prevent the "OverwriteModelError"
module.exports = mongoose.models.Result || mongoose.model('Result', resultSchema);
