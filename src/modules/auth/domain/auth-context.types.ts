export type AuthContext = {
  clerkUserId: string;
  userId: string;
  workspaceId: string;
};

export type ResolveAuthContextInput = {
  clerkUserId: string;
};
