import type { PrismaClient } from '../../../generated/prisma/client.js';

type CurrentDatabaseRow = {
  current_database: string;
};

export async function assertTestDatabase(prisma: PrismaClient) {
  const result = await prisma.$queryRawUnsafe<CurrentDatabaseRow[]>(
    'SELECT current_database()'
  );

  const currentDatabase = result[0]?.current_database;

  if (!currentDatabase) {
    throw new Error('Could not determine current database name');
  }

  if (!currentDatabase.startsWith('pulse_backend_test_')) {
    throw new Error(`Refusing to reset non-test database: ${currentDatabase}`);
  }
}

export async function resetDatabase(prisma: PrismaClient) {
  await assertTestDatabase(prisma);

  await prisma.$transaction([
    prisma.opportunity.deleteMany(),
    prisma.workspaceMember.deleteMany(),
    prisma.workspace.deleteMany(),
    prisma.user.deleteMany()
  ]);
}
