// Test script for password reset functionality
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testPasswordReset() {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'password123';

  console.log('🧪 Testing Password Reset Functionality\n');

  try {
    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: testEmail,
      password: testPassword,
    });
    console.log('✅ User registered successfully');
    console.log(`   Email: ${testEmail}\n`);

    // Step 2: Request password reset
    console.log('2️⃣ Requesting password reset...');
    const forgotRes = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: testEmail,
    });
    console.log('✅ Forgot password request successful');
    const resetCode = forgotRes.data.resetCode;
    console.log(`   Reset Code: ${resetCode}\n`);

    // Step 3: Reset password with code
    const newPassword = 'newpassword456';
    console.log('3️⃣ Resetting password with code...');
    const resetRes = await axios.post(`${API_URL}/auth/reset-password`, {
      email: testEmail,
      resetCode: resetCode,
      newPassword: newPassword,
    });
    console.log('✅ Password reset successfully');
    console.log(`   ${resetRes.data.message}\n`);

    // Step 4: Login with new password
    console.log('4️⃣ Logging in with new password...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: newPassword,
    });
    console.log('✅ Login successful with new password');
    console.log(`   Token: ${loginRes.data.token.substring(0, 20)}...\n`);

    console.log('🎉 All password reset tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

testPasswordReset();
