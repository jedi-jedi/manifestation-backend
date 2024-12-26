const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  programme: { type: String, required: true },
  semester: { type: String, required: true },
  session: { type: String, required: true },
  text: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);