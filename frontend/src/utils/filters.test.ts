import {
  applyDateDefaultsIfUnchanged,
  constrainAccountToBank,
  getAccountsForBank,
  getDefaultFilters
} from "./filters";
import type { AccountOption, DashboardFilters, FilterOptionsResponse } from "../types/dashboard";

const accounts: AccountOption[] = [
  { id: 1, bank_id: 10, name: "Checking", account_number: "001", currency: "USD" },
  { id: 2, bank_id: 20, name: "Savings", account_number: "002", currency: "USD" }
];

const filterOptions: FilterOptionsResponse = {
  banks: [],
  accounts,
  min_transaction_date: "2025-01-01",
  max_transaction_date: "2026-06-30"
};

describe("filter helpers", () => {
  it("derives default date filters from transaction date bounds", () => {
    expect(getDefaultFilters(filterOptions)).toEqual({
      startDate: "2025-01-01",
      endDate: "2026-06-30",
      bankId: null,
      accountId: null
    });
  });

  it("leaves default date filters empty when transaction date bounds are empty", () => {
    expect(
      getDefaultFilters({
        ...filterOptions,
        min_transaction_date: null,
        max_transaction_date: null
      })
    ).toEqual({
      startDate: "",
      endDate: "",
      bankId: null,
      accountId: null
    });
  });

  it("applies initial date defaults when date filters are unchanged", () => {
    const filters: DashboardFilters = {
      startDate: "",
      endDate: "",
      bankId: 10,
      accountId: 1
    };

    expect(applyDateDefaultsIfUnchanged(filters, filterOptions)).toEqual({
      ...filters,
      startDate: "2025-01-01",
      endDate: "2026-06-30"
    });
  });

  it("does not overwrite user-edited date filters with loaded bounds", () => {
    const filters: DashboardFilters = {
      startDate: "2026-01-01",
      endDate: "",
      bankId: null,
      accountId: null
    };

    expect(applyDateDefaultsIfUnchanged(filters, filterOptions)).toBe(filters);
  });

  it("returns all accounts when no bank is selected", () => {
    expect(getAccountsForBank(accounts, null)).toEqual(accounts);
  });

  it("returns only accounts for the selected bank", () => {
    expect(getAccountsForBank(accounts, 20)).toEqual([accounts[1]]);
  });

  it("clears an account that does not belong to the selected bank", () => {
    const filters: DashboardFilters = {
      startDate: "",
      endDate: "",
      bankId: 10,
      accountId: 2
    };

    expect(constrainAccountToBank(filters, accounts)).toEqual({
      ...filters,
      accountId: null
    });
  });

  it("keeps an account that belongs to the selected bank", () => {
    const filters: DashboardFilters = {
      startDate: "",
      endDate: "",
      bankId: 20,
      accountId: 2
    };

    expect(constrainAccountToBank(filters, accounts)).toBe(filters);
  });
});
