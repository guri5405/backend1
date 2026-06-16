const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Post = require('../models/Post');

// Create a post (any authenticated user)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({ title, content, createdBy: req.user._id });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get posts with pagination. Non-admins see only approved posts.
router.get('/', authenticate, async (req, res) => {
  try {
    const offset = parseInt(req.query.offset || '0', 10);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const filter = {};
    if (req.user.role !== 'admin') filter.status = 'approved';
    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).populate('createdBy', 'name email');
    res.json({ total, offset, limit, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get own posts
router.get('/mine', authenticate, async (req, res) => {
  try {
    const offset = parseInt(req.query.offset || '0', 10);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const filter = { createdBy: req.user._id };
    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit);
    res.json({ total, offset, limit, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
