import { describe, expect, it } from 'vitest';
import { extractUniqueConstraintFields } from '../modules/identity/infrastructure/extract-unique-constraint-fields.js';

describe('extractUniqueConstraintFields', () => {
  it('returns fields from meta.target when it is an array', () => {
    expect(
      extractUniqueConstraintFields({
        meta: {
          target: ['email']
        }
      })
    ).toEqual(['email']);
  });

  it('returns a single field from meta.target when it is a string', () => {
    expect(
      extractUniqueConstraintFields({
        meta: {
          target: 'email'
        }
      })
    ).toEqual(['email']);
  });

  it('returns fields from driver adapter constraint metadata', () => {
    expect(
      extractUniqueConstraintFields({
        meta: {
          driverAdapterError: {
            cause: {
              constraint: {
                fields: ['email']
              }
            }
          }
        }
      })
    ).toEqual(['email']);
  });

  it('returns an empty array when no unique fields are present', () => {
    expect(
      extractUniqueConstraintFields({
        meta: {}
      })
    ).toEqual([]);
  });
});
