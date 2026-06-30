import type { AccountOption, DashboardFilters } from "../types/dashboard";

export const defaultFilters: DashboardFilters = {
  startDate: "",
  endDate: "",
  bankId: null,
  accountId: null
};

export function getAccountsForBank(
  accounts: AccountOption[],
  bankId: number | null
): AccountOption[] {
  if (bankId === null) {
    return accounts;
  }

  return accounts.filter((account) => account.bank_id === bankId);
}

export function constrainAccountToBank(
  filters: DashboardFilters,
  accounts: AccountOption[]
): DashboardFilters {
  if (filters.bankId === null || filters.accountId === null) {
    return filters;
  }

  const selectedAccount = accounts.find((account) => account.id === filters.accountId);
  if (selectedAccount?.bank_id === filters.bankId) {
    return filters;
  }

  return {
    ...filters,
    accountId: null
  };
}
