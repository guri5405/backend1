const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');

const signAccess = (user) => jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' });
const signRefresh = (user) => jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;
    
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    if (role === 'admin') {
      if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) return res.status(403).json({ message: 'Invalid admin secret' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: role === 'admin' ? 'admin' : 'user' });
    await user.save();
    res.json({ message: 'Registered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    const session = new Session({ user: user._id, refreshToken, userAgent: req.get('User-Agent') });
    await session.save();
    res.cookie('accessToken', accessToken, { httpOnly: false });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken ? req.cookies.refreshToken : req.body.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const session = await Session.findOne({ user: payload.id, refreshToken: token });
    if (!session) return res.status(401).json({ message: 'Invalid session' });
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Invalid user' });
    const accessToken = signAccess(user);
    res.cookie('accessToken', accessToken, { httpOnly: false });
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token', error: err.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken ? req.cookies.refreshToken : req.body.refreshToken;
    if (token) await Session.findOneAndDelete({ refreshToken: token });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
