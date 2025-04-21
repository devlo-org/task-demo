// Test JWT security handling

// Set environment variables for testing
process.env.JWT_SECRET = 'test_secure_jwt_key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

const jwt = require('jsonwebtoken');

// 1. Test JWT signing with environment variable
try {
  const payload = { userId: '123', role: 'user' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('✅ JWT signing with proper environment secret works');
  
  // 2. Test verification
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ JWT verification with proper environment secret works');
  
  // 3. Test verification with wrong secret (should fail)
  try {
    const badToken = jwt.sign(payload, 'wrong_secret', { expiresIn: '1h' });
    jwt.verify(badToken, process.env.JWT_SECRET);
    console.error('❌ SECURITY ISSUE: Token signed with wrong secret was verified!');
  } catch (err) {
    console.log('✅ Security check: Rejected token signed with wrong secret');
  }
  
  // 4. Try to load our config with the right environment variables
  try {
    // This now requires both JWT_SECRET and MONGODB_URI to be set
    const config = require('./src/config/index');
    console.log('✅ Config loaded successfully with environment variables set');
    console.log('JWT Secret from config:', !!config.JWT_CONFIG.secret ? '[SECRET HIDDEN]' : 'missing');
    console.log('JWT ExpiresIn from config:', config.JWT_CONFIG.expiresIn);
  } catch (err) {
    console.error('❌ Config failed to load despite environment variables being set:', err.message);
  }
  
  // 5. Test missing environment variable
  delete process.env.JWT_SECRET;
  
  try {
    // Require directly to force reload
    require('./src/config/index');
    console.error('❌ SECURITY ISSUE: Config loaded without JWT_SECRET environment variable!');
  } catch (err) {
    console.log('✅ Config correctly requires JWT_SECRET environment variable');
  }
  
} catch (err) {
  console.error('❌ Test failed:', err);
}