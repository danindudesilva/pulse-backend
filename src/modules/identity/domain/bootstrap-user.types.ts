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
    role: 'owner' | 'member';
  };
};
