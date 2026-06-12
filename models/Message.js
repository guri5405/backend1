const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  room: { type: String },

  text: { type: String, required: true },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
