/**
 * Environment configuration
 */

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/amora',
    uriTest: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/amora_test'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

// Validate required environment variables
if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
  throw new Error('MONGODB_URI is required in production');
}

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production');
}

module.exports = config; 