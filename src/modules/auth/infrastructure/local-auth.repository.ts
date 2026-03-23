import type { AuthContext } from '../domain/auth-context.types.js';

export interface LocalAuthRepository {
  findAuthContextByClerkUserId(
    clerkUserId: string
  ): Promise<AuthContext | null>;
}
