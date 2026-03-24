import {
  NotFoundError,
  ValidationError
} from '../../../lib/errors/app-error.js';

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

export class QuoteSentAtInFutureError extends ValidationError {
  constructor() {
    super('quoteSentAt cannot be in the future');
  }
}

export class InvalidOpportunityStatusTransitionError extends ValidationError {
  constructor(from: string, to: string) {
    super(`Cannot transition opportunity status from ${from} to ${to}`);
  }
}

export class OpportunityNotFoundError extends NotFoundError {
  constructor() {
    super('Opportunity not found');
  }
}
