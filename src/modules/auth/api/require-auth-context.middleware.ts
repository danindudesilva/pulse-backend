import type { AuthContext } from '../domain/auth-context.types.js';

type ResolveAuthContextExecutor = {
  execute(input: { clerkUserId: string }): Promise<AuthContext>;
};

export function createRequireAuthContextMiddleware(
  _resolver: ResolveAuthContextExecutor
) {}
