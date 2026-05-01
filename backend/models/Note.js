const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, trim: true },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
