import { DEFAULT_WORKSPACE_FALLBACK_NAME } from './identity.constants.js';

export function buildDefaultWorkspaceName(
  name: string | null,
  email: string
): string {
  if (name && name.trim().length > 0) {
    const firstToken = name.trim().split(/\s+/)[0];

    if (firstToken) {
      return `${firstToken}'s Workspace`;
    }
  }

  const emailPrefix = email.split('@')[0]?.trim();

  if (emailPrefix) {
    return `${emailPrefix.charAt(0).toUpperCase()}${emailPrefix.slice(1)}'s Workspace`;
  }

  return DEFAULT_WORKSPACE_FALLBACK_NAME;
}
