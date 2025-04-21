// Test environment validation directly
delete process.env.JWT_SECRET;

function validateRequiredEnvVars() {
  const requiredEnvVars = ['JWT_SECRET'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is required`);
    }
  }
}

try {
  validateRequiredEnvVars();
  console.error('u274c VALIDATION FAILED: Did not throw error for missing JWT_SECRET');
} catch (error) {
  console.log('u2705 VALIDATION PASSED:', error.message);
}