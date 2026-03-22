import { ValidationError } from '../../../lib/errors/app-error.js';

export class InvalidInitialOpportunityStatusError extends ValidationError {
  constructor() {
    super('Initial opportunity status must be either draft or sent');
  }
}

export class QuoteSentAtRequiredError extends ValidationError {
  constructor() {
    super('quoteSentAt is required when status is sent');
  }
}
