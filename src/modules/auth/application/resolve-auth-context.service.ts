import { UnauthorizedError } from '../../../lib/errors/app-error.js';
import type {
  AuthContext,
  ResolveAuthContextInput
} from '../domain/auth-context.types.js';
import type { LocalAuthRepository } from '../infrastructure/local-auth.repository.js';

export class ResolveAuthContextService {
  constructor(private readonly localAuthRepository: LocalAuthRepository) {}

  async execute(input: ResolveAuthContextInput): Promise<AuthContext> {
    const authContext =
      await this.localAuthRepository.findAuthContextByClerkUserId(
        input.clerkUserId
      );

    if (!authContext) {
      throw new UnauthorizedError(
        'No local user context found for authenticated user'
      );
    }

    return authContext;
  }
}
