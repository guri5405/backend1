const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Session = require('../models/Session');

router.use(authenticate);

// List sessions for current user
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Revoke a session by id
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Revoked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
