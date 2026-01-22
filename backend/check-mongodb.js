// MongoDB Service Check Script
// Run: node check-mongodb.js

const { exec } = require('child_process');
const os = require('os');

console.log('🔍 Checking MongoDB status...\n');

if (os.platform() === 'win32') {
  // Windows
  exec('sc query MongoDB', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ MongoDB service not found or not installed');
      console.log('\n💡 Solutions:');
      console.log('1. Install MongoDB: https://www.mongodb.com/try/download/community');
      console.log('2. Or use MongoDB Atlas (Cloud): https://www.mongodb.com/cloud/atlas');
      console.log('3. Or manually start: mongod');
      return;
    }

    if (stdout.includes('RUNNING')) {
      console.log('✅ MongoDB service is RUNNING');
      console.log('✅ You can connect using: mongodb://localhost:27017');
    } else if (stdout.includes('STOPPED')) {
      console.log('⚠️  MongoDB service is STOPPED');
      console.log('\n💡 Start MongoDB service:');
      console.log('   net start MongoDB');
      console.log('   OR');
      console.log('   Services app → MongoDB → Start');
    } else {
      console.log('⚠️  MongoDB service status unknown');
      console.log('   Try: mongod (to start manually)');
    }
  });
} else {
  // Linux/Mac
  exec('pgrep mongod', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ MongoDB is not running');
      console.log('\n💡 Start MongoDB:');
      console.log('   mongod');
      console.log('   OR');
      console.log('   brew services start mongodb-community (Mac)');
      console.log('   OR');
      console.log('   sudo systemctl start mongod (Linux)');
    } else {
      console.log('✅ MongoDB is running');
      console.log('✅ Process ID:', stdout.trim());
      console.log('✅ You can connect using: mongodb://localhost:27017');
    }
  });
}

console.log('\n📝 Next steps:');
console.log('1. Open MongoDB Compass');
console.log('2. Connect to: mongodb://localhost:27017');
console.log('3. Create backend/.env file with MONGODB_URI');
console.log('4. Run: npm run test-connection');
