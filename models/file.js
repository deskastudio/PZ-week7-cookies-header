const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  path: String,
  size: Number,
  mimetype: String,
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);