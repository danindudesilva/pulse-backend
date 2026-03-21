import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../domain/bootstrap-user.types.js';
import type { IdentityRepository } from '../infrastructure/identity.repository.js';

export class BootstrapUserService {
  constructor(private readonly identityRepository: IdentityRepository) {}

  async execute(input: BootstrapUserInput): Promise<BootstrapUserResult> {
    return this.identityRepository.bootstrapUser(input);
  }
}
