// Diagnostic script for password reset issue
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function diagnose() {
  console.log('🔍 Diagnosing Password Reset Issue\n');

  // Test 1: Health Check
  try {
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Backend Server: Running');
  } catch (e) {
    console.log('❌ Backend Server: Not Running');
    return;
  }

  // Test 2: Register a test user first
  console.log('\n📝 Step 1: Creating test user...');
  try {
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: 'forgotpasswordtest@test.com',
      password: 'testpass123',
    });
    console.log('✅ User created:', registerRes.data.user.email);
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.error?.includes('already registered')) {
      console.log('ℹ️  User already exists');
    } else {
      console.log('❌ Registration failed:', err.response?.data?.error || err.message);
      return;
    }
  }

  // Test 3: Forgot Password Request
  console.log('\n🔑 Step 2: Testing forgot password request...');
  try {
    const forgotRes = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: 'forgotpasswordtest@test.com',
    });
    console.log('✅ Forgot password request successful');
    console.log('   Message:', forgotRes.data.message);
    if (forgotRes.data.resetCode) {
      console.log('   Reset Code:', forgotRes.data.resetCode);
      
      // Test 4: Reset Password with the code
      console.log('\n🔄 Step 3: Testing password reset...');
      try {
        const resetRes = await axios.post(`${API_URL}/auth/reset-password`, {
          email: 'forgotpasswordtest@test.com',
          resetCode: forgotRes.data.resetCode,
          newPassword: 'newpass456',
        });
        console.log('✅ Password reset successful');
        console.log('   Message:', resetRes.data.message);
      } catch (err) {
        console.log('❌ Password reset failed:', err.response?.data?.error || err.message);
      }
    }
  } catch (err) {
    console.log('❌ Forgot password request failed:', err.response?.data?.error || err.message);
    console.log('   Status:', err.response?.status);
  }

  console.log('\n✨ Diagnosis complete!');
}

diagnose().catch(err => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
