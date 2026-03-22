import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: '.env.test' });

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/tests/integration/**/*.test.ts'],
    fileParallelism: false
  }
});
