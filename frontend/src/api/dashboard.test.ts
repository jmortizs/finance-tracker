import { vi } from "vitest";

import { buildDashboardQuery, getSavingsGoal } from "./dashboard";
import type { DashboardFilters } from "../types/dashboard";

const filters: DashboardFilters = {
  startDate: "2026-06-01",
  endDate: "2026-06-30",
  bankId: 3,
  accountId: 7
};

describe("buildDashboardQuery", () => {
  it("serializes selected dashboard filters", () => {
    expect(buildDashboardQuery(filters)).toBe(
      "?start_date=2026-06-01&end_date=2026-06-30&bank_id=3&account_id=7"
    );
  });

  it("omits blank filters and includes extra values", () => {
    expect(
      buildDashboardQuery(
        {
          startDate: "",
          endDate: "",
          bankId: null,
          accountId: null
        },
        { type: "EXPENSE" }
      )
    ).toBe("?type=EXPENSE");
  });

  it("allows extra values to suppress base filter values", () => {
    expect(buildDashboardQuery(filters, { start_date: null, end_date: null })).toBe(
      "?bank_id=3&account_id=7"
    );
  });
});

describe("getSavingsGoal", () => {
  it("does not include global dashboard filters in the request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null)
    });
    vi.stubGlobal("fetch", fetchMock);

    await getSavingsGoal();

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/savings-goal", {
      headers: { Accept: "application/json" },
      signal: undefined
    });
  });
});
