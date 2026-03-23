import { Prisma } from '../../../generated/prisma/client.js';
import type {
  FollowUp,
  PrismaClient
} from '../../../generated/prisma/client.js';

export class PrismaFollowUpRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMany(followUps: Prisma.FollowUpCreateManyInput[]) {
    await this.prisma.followUp.createMany({ data: followUps });
  }

  async findMany(args: Prisma.FollowUpFindManyArgs): Promise<FollowUp[]> {
    return this.prisma.followUp.findMany(args);
  }

  async updateMany(args: {
    where: Prisma.FollowUpWhereInput;
    data: Prisma.FollowUpUpdateManyMutationInput;
  }) {
    return this.prisma.followUp.updateMany(args);
  }
}
