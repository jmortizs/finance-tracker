## Context

`AnalyticsEngine.get_dashboard_metrics()` currently calculates current totals for the selected filters, derives a previous period with the same day count as the selected range, and passes both totals into `_metric()` to produce `previous_value` and `change_percent`. This makes long date ranges compare against a long historical range, while the requested dashboard behavior is to compare variance against the immediately previous calendar month.

The backend already centralizes dashboard metric construction in `backend/app/services/analytics_engine.py`, so the change can be implemented there without changing the API schema or frontend request flow.

## Goals / Non-Goals

**Goals:**

- Make all dashboard metric percentage changes use a previous calendar month baseline.
- Use the selected `end_date` as the anchor for determining the current month and previous month.
- Treat balance variance as an as-of comparison between the selected range end date closing balance and the previous month closing balance.
- Preserve existing response fields: `value`, `previous_value`, and `change_percent`.
- Keep bank and account filters applied consistently to current and previous baseline calculations.

**Non-Goals:**

- Add multi-period trend analysis or new dashboard metrics.
- Change frontend filter controls or endpoint URLs.
- Change category distribution or chart endpoint behavior except where shared helper logic must remain correct.
- Introduce new storage models or external dependencies.

## Decisions

1. Use previous calendar month boundaries instead of equal-length previous ranges.

   The previous baseline window will be the full calendar month immediately before the selected `end_date` month. For an `end_date` of 2026-06-30, the baseline month is 2026-05-01 through 2026-05-31. This directly matches the requested month-over-month variance behavior and avoids range-length comparisons such as 2025-01-01 through 2026-06-30 versus a preceding 18-month window.

   Alternative considered: continue deriving a previous range from `start_date`. That preserves existing behavior but contradicts the requested previous-month baseline.

2. Anchor baseline selection on `end_date`.

   `end_date` identifies the latest selected reporting point and therefore the previous month used for comparison. If no `end_date` is provided, the service should retain the current unbounded fallback behavior or use a clearly documented default only if the existing API already has one.

   Alternative considered: anchor on `start_date`. That fails for broad ranges because it would compare against the month before the beginning of the selected period instead of the month before the reporting endpoint.

3. Separate balance closing calculations from range activity totals.

   Balance variance needs closing balance as of the selected `end_date` and closing balance as of the prior month end. The implementation should avoid treating balance as only `income - expenses` inside the selected date range when calculating balance variance, because the prompt's example depends on cumulative balance as of a date.

   Alternative considered: compare selected-range net movement to previous-month net movement. That may match the current helper shape but does not produce "balance as of June 30th" compared with "closing balance on May 31st."

4. Keep `_metric()` and percentage rounding behavior stable.

   The existing `_change_percent()` behavior returns `None` when the previous value is zero and rounds percentages to two decimal places. Keeping this behavior limits API churn and avoids forcing frontend changes.

   Alternative considered: return `0.00` when the previous value is zero. That would change existing response semantics beyond the requested baseline adjustment.

## Risks / Trade-offs

- Current repository APIs only expose filtered range totals, not an explicit closing-balance query. -> Add or reuse a repository-level query that can calculate totals through a cutoff date while applying bank/account filters.
- The term "all metrics" can include metrics with different natural baselines. -> Implement explicit tests for balance, income, expenses, net savings, and savings percentage so each previous value and change percent is covered.
- Unbounded date filters may not have a natural previous-month anchor. -> Preserve current behavior for missing `end_date` unless requirements are clarified during implementation.
