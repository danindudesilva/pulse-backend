import type { OpportunityStatus } from '../../../generated/prisma/client.js';

export type CreateOpportunityInput = {
  workspaceId: string;
  createdByUserId: string;
  title: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  valueAmount?: string;
  currency?: string;
  notes?: string;
  status: OpportunityStatus;
  quoteSentAt?: Date;
};

export type OpportunitySummary = {
  id: string;
  workspaceId: string;
  createdByUserId: string;
  title: string;
  companyName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  valueAmount: string | null;
  currency: string | null;
  notes: string | null;
  status: OpportunityStatus;
  quoteSentAt: Date | null;
  nextFollowUpAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OpportunityListView = 'all' | 'due' | 'upcoming';

export type ListOpportunitiesInput = {
  workspaceId: string;
  view?: OpportunityListView;
  status?: OpportunityStatus;
};

export type GetOpportunityInput = {
  workspaceId: string;
  opportunityId: string;
};

export type UpdateOpportunityStatusInput = {
  workspaceId: string;
  opportunityId: string;
  status: OpportunityStatus;
  quoteSentAt?: Date;
};
