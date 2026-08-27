export const beneficiaryKeys = {
  all: (orgId: string) => ["beneficiaries", orgId] as const,
  lists: (orgId: string) => [...beneficiaryKeys.all(orgId), "list"] as const,
  details: (orgId: string) =>
    [...beneficiaryKeys.all(orgId), "detail"] as const,
  detail: (orgId: string, beneficiaryId: string) =>
    [...beneficiaryKeys.details(orgId), beneficiaryId] as const,
};
