import { describe, expect, it } from 'vitest';
import { buildDefaultWorkspaceName } from '../modules/identity/domain/build-default-workspace-name.js';

describe('buildDefaultWorkspaceName', () => {
  it('uses the first token from name when name is present', () => {
    expect(buildDefaultWorkspaceName('Jack Sparrow', 'jack@example.com')).toBe(
      "Jack's Workspace"
    );
  });

  it('trims leading and trailing whitespace from name', () => {
    expect(
      buildDefaultWorkspaceName('   Jack Sparrow   ', 'jack@example.com')
    ).toBe("Jack's Workspace");
  });

  it('falls back to the email prefix when name is missing', () => {
    expect(buildDefaultWorkspaceName(null, 'captain@blackpearl.com')).toBe(
      "Captain's Workspace"
    );
  });

  it('falls back to the email prefix when name is blank', () => {
    expect(buildDefaultWorkspaceName('   ', 'captain@blackpearl.com')).toBe(
      "Captain's Workspace"
    );
  });
});
