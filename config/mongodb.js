const mongoose = require('mongoose');
require('dotenv').config();

// Get the connection string from .env
const dbURI = process.env.DATABASE_CONNECTION;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
