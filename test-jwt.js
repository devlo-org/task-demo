// Test script for JWT secret handling
process.env.JWT_SECRET = 'test_secure_jwt_key';
process.env.JWT_EXPIRES_IN = '1h';

const jwt = require('jsonwebtoken');

// Test JWT sign/verify with environment variable
const payload = { userId: '123', role: 'user' };

try {
  // Sign with environment variable
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  console.log('Token created successfully:', token);
  
  // Verify with environment variable
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Token verified successfully:', decoded);

  // Security test: try to use fallback secret (should fail)
  try {
    const badToken = jwt.sign(payload, 'fallback_secret', { expiresIn: '1h' });
    const shouldFail = jwt.verify(badToken, process.env.JWT_SECRET);
    console.error('❌ SECURITY ISSUE: Fallback secret token verified with real secret');
  } catch (err) {
    console.log('✅ Security check passed: Tokens signed with different secrets are rejected');
  }

  // Clear environment variable to test our error handling
  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  
  try {
    // Load our config module which should check for required environment variables
    console.log('Testing config validation without JWT_SECRET...');
    const { JWT_CONFIG } = require('./dist/config');
    console.error('❌ FAILED: Config did not throw error for missing JWT_SECRET');
  } catch (err) {
    console.log('✅ Validation check passed: Config properly detected missing JWT_SECRET:', err.message);
  }

  // Restore environment variable
  process.env.JWT_SECRET = originalSecret;
  
} catch (error) {
  console.error('Test failed:', error);
}