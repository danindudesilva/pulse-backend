import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '../../../generated/prisma/client.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set for integration tests. Load .env.test before running them.'
  );
}

const pool = new pg.Pool({
  connectionString: databaseUrl
});

const adapter = new PrismaPg(pool);

export const prismaTestClient = new PrismaClient({
  adapter
});

export async function disconnectPrismaTestClient() {
  await prismaTestClient.$disconnect();
  await pool.end();
}
