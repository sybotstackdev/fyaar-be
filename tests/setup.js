// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  // Helper to create test user data
  createTestUserData: (overrides = {}) => ({
    firstName: 'Test',
    lastName: 'User',
    email: `test.${Date.now()}@example.com`,
    password: 'TestPassword123',
    ...overrides
  }),

  // Helper to create admin user data
  createAdminUserData: (overrides = {}) => ({
    firstName: 'Admin',
    lastName: 'User',
    email: `admin.${Date.now()}@example.com`,
    password: 'AdminPassword123',
    role: 'admin',
    ...overrides
  })
};

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}; 