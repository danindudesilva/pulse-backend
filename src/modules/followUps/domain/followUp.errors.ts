import { ValidationError } from '../../../lib/errors/app-error.js';

export class InvalidFollowUpIdsError extends ValidationError {
  constructor() {
    super('At least one follow-up id is required');
  }
}
