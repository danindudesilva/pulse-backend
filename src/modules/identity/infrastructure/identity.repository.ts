import type {
  BootstrapUserInput,
  BootstrapUserResult
} from '../domain/bootstrap-user.types.js';

export interface IdentityRepository {
  bootstrapUser(input: BootstrapUserInput): Promise<BootstrapUserResult>;
}
