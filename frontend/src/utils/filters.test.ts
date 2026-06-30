import { constrainAccountToBank, getAccountsForBank } from "./filters";
import type { AccountOption, DashboardFilters } from "../types/dashboard";

const accounts: AccountOption[] = [
  { id: 1, bank_id: 10, name: "Checking", account_number: "001", currency: "USD" },
  { id: 2, bank_id: 20, name: "Savings", account_number: "002", currency: "USD" }
];

describe("filter helpers", () => {
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
