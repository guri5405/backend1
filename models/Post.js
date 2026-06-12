const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

  title: { type: String, required: true },

  content: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
