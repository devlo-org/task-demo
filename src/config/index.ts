import { config } from 'dotenv';
import { Secret } from 'jsonwebtoken';

// Load environment variables
config();

// Required environment variables validation
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

// Immediately validate environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    throw new Error(`Environment variable ${envVar} is required`);
  }
}

// JWT configuration
export const JWT_CONFIG = {
  get secret(): Secret {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return process.env.JWT_SECRET as Secret;
  },
  expiresIn: process.env.JWT_EXPIRES_IN || '24h' as string,
};

// Server configuration
export const SERVER_CONFIG = {
  port: process.env.PORT || 3000,
};

// Database configuration
export const DB_CONFIG = {
  uri: process.env.MONGODB_URI as string,
};

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
