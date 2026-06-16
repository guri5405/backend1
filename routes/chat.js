const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Message = require('../models/Message');

router.use(authenticate);

// Get chat history between current user and another user
router.get('/history/:userId', async (req, res) => {
  try {
    const other = req.params.userId;
    const offset = parseInt(req.query.offset || '0', 10);
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const filter = { $or: [ { from: req.user._id, to: other }, { from: other, to: req.user._id } ] };
    const total = await Message.countDocuments(filter);
    const messages = await Message.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit);
    res.json({ total, offset, limit, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
