const mongoose = require('mongoose');

const connectDB = async (uri) => {
  if (!uri) throw new Error('MONGO_URI is required');
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected');
};

module.exports = connectDB;
