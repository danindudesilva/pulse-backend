import type { AuthContext } from '../modules/auth/domain/auth-context.types.js';

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext;
    }
  }
}
