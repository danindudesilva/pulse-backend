import type { WorkspaceRole } from '@prisma/client';

export const WORKSPACE_OWNER_ROLE: WorkspaceRole = 'owner';
export const WORKSPACE_MEMBER_ROLE: WorkspaceRole = 'member';

export const DEFAULT_WORKSPACE_FALLBACK_NAME = 'My Workspace';
