import { buildDashboardQuery } from "./dashboard";
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
