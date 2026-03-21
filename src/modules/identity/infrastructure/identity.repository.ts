import type { WorkspaceRole } from '@prisma/client';
import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../domain/bootstrap-user.types.js';

export interface IdentityRepository {
  bootstrapUser(input: BootstrapUserInput): Promise<BootstrapUserResult>;
}

export type BootstrapUserPersistenceResult = {
  user: {
    id: string;
    clerkUserId: string;
    email: string;
    name: string | null;
  };
  workspace: {
    id: string;
    name: string;
  };
  membership: {
    role: WorkspaceRole;
  };
};
