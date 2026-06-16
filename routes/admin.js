const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const Post = require('../models/Post');

// All admin routes require authenticate + admin role
router.use(authenticate, requireRole('admin'));

// List posts with optional status filter
router.get('/posts', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset || '0', 10);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).populate('createdBy', 'name email');
    res.json({ total, offset, limit, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change post status
router.patch('/posts/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const post = await Post.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
