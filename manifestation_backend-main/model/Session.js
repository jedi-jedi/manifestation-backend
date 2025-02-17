// models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Session', sessionSchema);
