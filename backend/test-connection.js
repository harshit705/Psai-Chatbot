// MongoDB Connection Test Script
// Run this to check if MongoDB is connected: node test-connection.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Force DNS servers to resolve SRV records correctly on local machine
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not defined in your .env file.');
  process.exit(1);
}

console.log('🔄 Testing MongoDB Atlas connection...');
console.log('📍 Connection URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide password

mongoose
  .connect(MONGODB_URI)
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
    console.log('1. Verify MONGODB_URI in backend/.env file');
    console.log('2. Ensure your current IP address is whitelisted on your Atlas cluster');
    console.log('3. Verify database user credentials (e.g. username and password)');
    console.log('4. Check network connection and DNS settings');
    process.exit(1);
  });
