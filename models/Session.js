const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
  user: { type: mongoose.Schema.Types.ObjectId,
  ref: 'User', required: true },

  refreshToken: { type: String, required: true },

  userAgent: { type: String },,
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
