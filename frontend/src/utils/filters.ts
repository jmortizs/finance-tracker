import type { AccountOption, DashboardFilters, FilterOptionsResponse } from "../types/dashboard";

export const defaultFilters: DashboardFilters = {
  startDate: "",
  endDate: "",
  bankId: null,
  accountId: null
};

export function getDefaultFilters(options: FilterOptionsResponse | null | undefined): DashboardFilters {
  return {
    ...defaultFilters,
    startDate: options?.min_transaction_date ?? "",
    endDate: options?.max_transaction_date ?? ""
  };
}

export function applyDateDefaultsIfUnchanged(
  filters: DashboardFilters,
  options: FilterOptionsResponse
): DashboardFilters {
  if (filters.startDate !== defaultFilters.startDate || filters.endDate !== defaultFilters.endDate) {
    return filters;
  }

  return {
    ...filters,
    startDate: options.min_transaction_date ?? "",
    endDate: options.max_transaction_date ?? ""
  };
}

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
