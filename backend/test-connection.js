// MongoDB Connection Test Script
// Run this to check if MongoDB is connected: node test-connection.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/psai-chatbot';

console.log('🔄 Testing MongoDB connection...');
console.log('📍 Connection URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide password

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    console.log('✅ Database:', mongoose.connection.name);
    console.log('✅ Host:', mongoose.connection.host);
    console.log('✅ Port:', mongoose.connection.port);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n💡 Solutions:');
    console.log('1. Check if MongoDB is running (mongod)');
    console.log('2. Verify MONGODB_URI in .env file');
    console.log('3. Check network connection (if using Atlas)');
    console.log('4. Verify MongoDB credentials');
    process.exit(1);
  });
