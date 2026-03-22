import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '../../../generated/prisma/client.js';
import { getIntegrationDatabaseUrl } from './test-database-url.js';

export function createPrismaTestClient(databaseSuffix: string) {
  const databaseUrl = getIntegrationDatabaseUrl(databaseSuffix);

  const pool = new pg.Pool({
    connectionString: databaseUrl
  });

  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter
  });

  async function disconnect() {
    await prisma.$disconnect();
    await pool.end();
  }

  return {
    prisma,
    disconnect,
    databaseUrl
  };
}
