// Unset JWT_SECRET to test validation
delete process.env.JWT_SECRET;

try {
  // This should throw an error if validation works properly
  require('./src/config/index');
  console.error('❌ VALIDATION FAILED: Config did not throw error for missing JWT_SECRET');
} catch (error) {
  console.log('✅ VALIDATION PASSED:', error.message);
}