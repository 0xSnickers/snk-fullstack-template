process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'postgresql://app:password@localhost:5432/nestjs_template_test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123';
process.env.SEED_DEMO_USER = 'true';
process.env.LOG_FILE = '';
