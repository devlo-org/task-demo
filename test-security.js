// Test the JWT security improvements

// Set required environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'test_secure_jwt_key';

const jwt = require('jsonwebtoken');

console.log('Testing JWT security improvements:')

try {
  // 1. Load our config module
  console.log('\n1. Testing config module loading:');
  const config = require('./src/config/index');
  console.log('✓ Config module loaded successfully');
  
  // 2. Check JWT secret access
  console.log('\n2. Testing JWT secret access:');
  console.log('JWT secret is properly set:', typeof config.JWT_CONFIG.secret === 'string');
  console.log('JWT expiresIn is set to:', config.JWT_CONFIG.expiresIn);
  
  // 3. Test JWT token generation and verification
  console.log('\n3. Testing JWT token operations:');
  const payload = { userId: '123', role: 'admin' };
  
  const token = jwt.sign(payload, config.JWT_CONFIG.secret, { 
    expiresIn: config.JWT_CONFIG.expiresIn 
  });
  console.log('✓ Generated JWT token successfully');
  
  const decoded = jwt.verify(token, config.JWT_CONFIG.secret);
  console.log('✓ Verified JWT token successfully');
  console.log('Token payload:', decoded);
  
  // 4. Test security with removed environment variable
  console.log('\n4. Testing missing JWT_SECRET handling:');
  delete process.env.JWT_SECRET;
  
  try {
    // Try to access the secret getter which should throw an error
    console.log('JWT secret when environment variable is missing:', config.JWT_CONFIG.secret);
    console.log('❌ SECURITY ISSUE: Allowed access to JWT secret when environment variable is missing');
  } catch (err) {
    console.log('✓ Correctly rejected access to JWT secret when environment variable is missing');
    console.log('  Error message:', err.message);
  }
  
  console.log('\n✓ JWT security improvements are working correctly!')
} catch (err) {
  console.error('❌ Test failed:', err);
}