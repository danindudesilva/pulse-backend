import { prismaTestClient } from './prisma-test-client.js';

export async function resetDatabase() {
  await prismaTestClient.$transaction([
    prismaTestClient.opportunity.deleteMany(),
    prismaTestClient.workspaceMember.deleteMany(),
    prismaTestClient.workspace.deleteMany(),
    prismaTestClient.user.deleteMany()
  ]);
}
