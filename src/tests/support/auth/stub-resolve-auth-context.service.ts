import type { AuthContext } from '../../../modules/auth/domain/auth-context.types.js';

export class StubResolveAuthContextService {
  constructor(private readonly authContext: AuthContext) {}

  async execute(): Promise<AuthContext> {
    return this.authContext;
  }
}
