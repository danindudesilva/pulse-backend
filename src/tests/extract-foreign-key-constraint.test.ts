import { describe, expect, it } from 'vitest';
import { extractForeignKeyConstraintName } from '../modules/opportunities/infrastructure/extract-foreign-key-constraint.js';

describe('extractForeignKeyConstraintName', () => {
  it('returns the field name when meta.field_name is present', () => {
    expect(
      extractForeignKeyConstraintName({
        meta: {
          field_name: 'workspaceId'
        }
      })
    ).toBe('workspaceId');
  });

  it('returns the adapter constraint index when present', () => {
    expect(
      extractForeignKeyConstraintName({
        meta: {
          driverAdapterError: {
            cause: {
              constraint: {
                index: 'opportunities_workspaceId_fkey'
              }
            }
          }
        }
      })
    ).toBe('opportunities_workspaceId_fkey');
  });

  it('returns null when no constraint metadata is present', () => {
    expect(
      extractForeignKeyConstraintName({
        meta: {}
      })
    ).toBeNull();
  });
});
