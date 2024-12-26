// models/Programme.js
const mongoose = require('mongoose');

const programmeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Programme', programmeSchema);
