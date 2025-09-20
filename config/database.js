const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://Rajika:rQ3kCc7Dsn3qM8GT@cluster0.lugassm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'Solarsync';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected successfully to database: ${DB_NAME}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

//test

module.exports = connectDB;
