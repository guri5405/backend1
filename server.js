require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');
const sessionsRoutes = require('./routes/sessions');
const chatRoutes = require('./routes/chat');
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/chat', chatRoutes);

app.get("/", (req, res) => {
  res.send("server is running correctly!")
})

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: true, methods: ['GET','POST'], credentials: true } });

// Helper to build a deterministic room id for two users
const roomId = (a, b) => [a.toString(), b.toString()].sort().join(':');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.userId = payload.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  socket.join(socket.userId);
  socket.on('joinWith', (otherUserId) => {
    const r = roomId(socket.userId, otherUserId);
    socket.join(r);
  });

  socket.on('message', async (data) => {
    try {
      const { to, text } = data;
      if (!to || !text) return;
      const r = roomId(socket.userId, to);
      const msg = new Message({ from: socket.userId, to, text, room: r });
      await msg.save();
      io.to(r).emit('message', { from: socket.userId, to, text, createdAt: msg.createdAt });
      io.to(to).emit('message.received', { from: socket.userId, text });
    } catch (err) {
      console.error('socket message error', err);
    }
  });
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(PORT, () => console.log('Server running on port', PORT));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
