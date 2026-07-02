import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { App } from "./App";

vi.mock("./components/charts/BalanceEvolutionChart", () => ({
  BalanceEvolutionChart: () => <div>Balance chart</div>
}));

vi.mock("./components/charts/CashFlowChart", () => ({
  CashFlowChart: () => <div>Cash flow chart</div>
}));

vi.mock("./components/charts/DistributionChart", () => ({
  DistributionChart: () => <div>Distribution chart</div>
}));

vi.mock("./hooks/useDashboard", () => ({
  useDashboard: () => ({
    filters: {
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      bankId: null,
      accountId: null
    },
    setFilters: vi.fn(),
    resetFilters: vi.fn(),
    refresh: vi.fn(),
    options: {
      status: "success",
      data: {
        banks: [],
        accounts: [],
        min_transaction_date: "2026-01-01",
        max_transaction_date: "2026-12-31"
      },
      error: null
    },
    availableAccounts: [],
    metrics: {
      status: "success",
      data: {
        balance: { value: 10995.86, previousValue: 8074.94, changePercent: 36.17 },
        income: { value: 23325.8, previousValue: 5375.73, changePercent: 22.36 },
        expenses: { value: 12329.94, previousValue: 2957.77, changePercent: 23.64 },
        netSavings: { value: 10995.86, previousValue: 2417.96, changePercent: 20.8 },
        savingsPercentage: { value: 47.14, previousValue: 44.93, changePercent: -1.29 }
      },
      error: null
    },
    balanceEvolution: { status: "success", data: [], error: null },
    cashFlow: { status: "success", data: [], error: null },
    incomeDistribution: { status: "success", data: [], error: null },
    expenseDistribution: { status: "success", data: [], error: null },
    savingsGoal: {
      status: "success",
      data: {
        id: 1,
        targetAmount: 15000,
        startDate: "2026-01-01",
        endDate: "2026-12-31",
        progress: 10995.86,
        completionPercentage: 73.31
      },
      error: null
    },
    saveSavingsGoal: vi.fn()
  })
}));

describe("App", () => {
  it("replaces the Savings % metric with the savings goal card", () => {
    render(<App />);

    expect(screen.getByText("Balance")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(screen.getByText("Net savings")).toBeInTheDocument();
    expect(screen.queryByText("Savings %")).not.toBeInTheDocument();
    expect(screen.getByText("Savings Goal")).toBeInTheDocument();
    expect(screen.getByText("$15,000.00")).toBeInTheDocument();
    expect(screen.getByText("73.31%")).toBeInTheDocument();
    expect(screen.getAllByText("$10,995.86").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2026-12-31")).toBeInTheDocument();
  });
});
