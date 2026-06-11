const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  favicon: {
    type: String,
    required: true
  },
  customName: {
    type: String,
    default: null
  },
  pinned: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('URL', urlSchema);
