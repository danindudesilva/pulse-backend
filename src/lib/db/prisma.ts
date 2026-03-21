import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '../../config/env.js';
import { PrismaClient } from '../../generated/prisma/client.js';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['warn', 'error']
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
