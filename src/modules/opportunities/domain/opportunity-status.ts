export const CREATEABLE_OPPORTUNITY_STATUSES = ['draft', 'sent'] as const;

export type CreateableOpportunityStatus =
  (typeof CREATEABLE_OPPORTUNITY_STATUSES)[number];

export function isCreateableOpportunityStatus(
  value: string
): value is CreateableOpportunityStatus {
  return CREATEABLE_OPPORTUNITY_STATUSES.includes(
    value as CreateableOpportunityStatus
  );
}
