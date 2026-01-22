const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

async function test() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Try to create a test user
    console.log('\n📝 Creating test user...');
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    await testUser.save();
    console.log('✅ User created:', testUser);

    // Check if user exists
    const foundUser = await User.findOne({ email: 'test@example.com' });
    console.log('✅ User found:', foundUser);

    // Test password comparison
    const isMatch = await foundUser.comparePassword('password123');
    console.log('✅ Password match:', isMatch);

    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
