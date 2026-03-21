import type {
  WORKSPACE_MEMBER_ROLE,
  WORKSPACE_OWNER_ROLE
} from './identity.constants.js';

export type BootstrapUserExecutor = {
  execute(input: BootstrapUserInput): Promise<BootstrapUserResult>;
};

export type BootstrapUserInput = {
  clerkUserId: string;
  email: string;
  name?: string;
};

export type BootstrapUserResult = {
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
    role: typeof WORKSPACE_OWNER_ROLE | typeof WORKSPACE_MEMBER_ROLE;
  };
};
