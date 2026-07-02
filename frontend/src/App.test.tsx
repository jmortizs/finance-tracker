import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";

import { App } from "./App";
import { useDashboard } from "./hooks/useDashboard";
import type { NormalizedMetrics, NormalizedSavingsGoal, ResourceState } from "./types/dashboard";

vi.mock("./hooks/useDashboard", () => ({
  useDashboard: vi.fn()
}));

const metrics: NormalizedMetrics = {
  balance: { value: 10000, previousValue: 9000, changePercent: 11.11 },
  income: { value: 5000, previousValue: 4500, changePercent: 11.11 },
  expenses: { value: 2000, previousValue: 1800, changePercent: 11.11 },
  netSavings: { value: 3000, previousValue: 2700, changePercent: 11.11 },
  savingsPercentage: { value: 60, previousValue: 50, changePercent: 10 }
};

const savingsGoal: ResourceState<NormalizedSavingsGoal | null> = {
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
};

function mockDashboard() {
  vi.mocked(useDashboard).mockReturnValue({
    filters: { startDate: "", endDate: "", bankId: null, accountId: null },
    setFilters: vi.fn(),
    resetFilters: vi.fn(),
    refresh: vi.fn(),
    options: {
      status: "success",
      data: { banks: [], accounts: [], min_transaction_date: null, max_transaction_date: null },
      error: null
    },
    availableAccounts: [],
    metrics: { status: "success", data: metrics, error: null },
    balanceEvolution: { status: "success", data: [], error: null },
    cashFlow: { status: "success", data: [], error: null },
    incomeDistribution: { status: "success", data: [], error: null },
    expenseDistribution: { status: "success", data: [], error: null },
    savingsGoal,
    saveSavingsGoal: vi.fn()
  });
}

describe("App", () => {
  it("replaces the top-row Savings % KPI with the savings goal card", () => {
    mockDashboard();

    render(<App />);

    const topGrid = screen.getByLabelText("Top dashboard metrics");
    const topGridItems = Array.from(topGrid.children) as HTMLElement[];

    expect(topGridItems).toHaveLength(5);
    expect(within(topGrid).queryByText("Savings %")).not.toBeInTheDocument();
    expect(within(topGridItems[4]).getByText("Savings Goal")).toBeInTheDocument();
    expect(within(topGridItems[4]).getByText("$15,000.00")).toBeInTheDocument();
    expect(within(topGridItems[4]).getByText("73.31%")).toBeInTheDocument();
    expect(within(topGridItems[4]).getByText("Progress $10,995.86")).toBeInTheDocument();
    expect(within(topGridItems[4]).getByText("2026-12-31")).toBeInTheDocument();
  });
});
