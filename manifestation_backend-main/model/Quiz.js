// models/Quiz.js
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  programme: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
  semester: { type: String, required: true }, // 'First', 'Second', etc.
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  questions: [{ type: String }], // Store quiz questions as an array
});

module.exports = mongoose.model('Quiz', quizSchema);
